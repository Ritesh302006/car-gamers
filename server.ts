import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import { createServer } from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  app.use(express.json());

  // Battle System State
  interface BattlePlayer {
    id: string;
    username: string;
    hp: number;
    maxHp: number;
    energy: number;
    maxEnergy: number;
    status: 'idle' | 'defending';
    profile?: any;
    socket?: any; // omitted in public state
  }
  
  interface BattleRoom {
    id: string;
    status: 'waiting' | 'playing' | 'finished';
    players: BattlePlayer[];
    currentTurnIndex: number;
    winnerId: string | null;
    isBotMatch?: boolean;
  }

  const battleRooms = new Map<string, BattleRoom>();

  function getPublicGameState(room: BattleRoom) {
    return {
      id: room.id,
      status: room.status,
      currentTurnId: room.players[room.currentTurnIndex]?.id,
      winnerId: room.winnerId,
      players: room.players.map(p => ({
        id: p.id,
        username: p.username,
        hp: p.hp,
        maxHp: p.maxHp,
        energy: p.energy,
        maxEnergy: p.maxEnergy,
        status: p.status,
        profile: p.profile
      }))
    };
  }

  function handleBotTurn(roomId: string) {
    const room = battleRooms.get(roomId);
    if (!room || room.status !== "playing" || !room.isBotMatch) return;
    
    setTimeout(() => {
        const botIndex = 1;
        const bot = room.players[botIndex];
        const player = room.players[0];

        if (room.currentTurnIndex !== botIndex || room.status !== 'playing') return;

        bot.status = 'idle';
        let actionType = 'attack';
        const rand = Math.random();
        
        if (bot.energy >= 50 && rand > 0.4) {
            actionType = 'special';
        } else if (bot.hp < 40 && rand > 0.5) {
            actionType = 'defend';
        } else if (rand > 0.8) {
            actionType = 'defend';
        }

        let actionLog = "";
        if (actionType === "attack") {
            let dmg = Math.floor(Math.random() * 11) + 10;
            if (player.status === "defending") { dmg = Math.floor(dmg / 2); player.status = "idle"; }
            player.hp = Math.max(0, player.hp - dmg);
            bot.energy = Math.min(bot.maxEnergy, bot.energy + 20);
            actionLog = `${bot.username} attacked for ${dmg} damage!`;
        } else if (actionType === "defend") {
            bot.status = "defending";
            bot.energy = Math.min(bot.maxEnergy, bot.energy + 30);
            actionLog = `${bot.username} is defending! (+30 Energy)`;
        } else if (actionType === "special") {
            bot.energy -= 50;
            let dmg = Math.floor(Math.random() * 16) + 25;
            if (player.status === "defending") { dmg = Math.floor(dmg / 2); player.status = "idle"; }
            player.hp = Math.max(0, player.hp - dmg);
            actionLog = `${bot.username} used SPECIAL and dealt ${dmg} damage!`;
        }

        io.to(roomId).emit("actionLog", actionLog);

        if (player.hp <= 0) {
            room.status = "finished";
            room.winnerId = bot.id;
            io.to(roomId).emit("gameOver", { winnerUsername: bot.username, winnerId: bot.id });
        } else {
            room.currentTurnIndex = 0;
        }

        io.to(roomId).emit("gameState", getPublicGameState(room));
    }, 1500); // 1.5 second delay for bot actions
  }

  io.on("connection", (socket) => {
    socket.on("createRoom", ({ username, profile }) => {
      const roomId = crypto.randomBytes(3).toString("hex").toUpperCase();
      const newRoom: BattleRoom = {
        id: roomId,
        status: "waiting",
        players: [{ id: socket.id, username, hp: 100, maxHp: 100, energy: 0, maxEnergy: 100, status: 'idle', socket, profile }],
        currentTurnIndex: 0,
        winnerId: null,
        isBotMatch: false
      };
      battleRooms.set(roomId, newRoom);
      socket.join(roomId);
      socket.emit("roomCreated", roomId);
      socket.emit("gameState", getPublicGameState(newRoom));
    });

    socket.on("addBot", ({ roomId }) => {
        roomId = roomId.toUpperCase();
        const room = battleRooms.get(roomId);
        if (!room) return socket.emit("errorLog", "Room not found");
        if (room.status !== "waiting") return socket.emit("errorLog", "Room is already full");
        if (room.players[0].id !== socket.id) return socket.emit("errorLog", "Only creator can add bot");

        room.isBotMatch = true;
        
        const botProfile = {
            paint: "#ff2bd6",
            decal: "stripe_double",
            decalColor: "#ffffff"
        };

        room.players.push({
            id: 'bot_id', username: 'CyBot', hp: 100, maxHp: 100, energy: 0, maxEnergy: 100, status: 'idle', profile: botProfile
        });
        room.status = "playing";
        room.currentTurnIndex = Math.random() < 0.5 ? 0 : 1;

        io.to(roomId).emit("gameStarted");
        io.to(roomId).emit("gameState", getPublicGameState(room));
        io.to(roomId).emit("actionLog", "Battle started against CyBot!");

        if (room.currentTurnIndex === 1) {
            handleBotTurn(roomId);
        }
    });

    socket.on("joinRoom", ({ roomId, username, profile }) => {
      roomId = roomId.toUpperCase();
      const room = battleRooms.get(roomId);
      if (!room) return socket.emit("errorLog", "Room not found");
      if (room.status !== "waiting") return socket.emit("errorLog", "Room is already full or in progress");
      
      room.players.push({
        id: socket.id, username, hp: 100, maxHp: 100, energy: 0, maxEnergy: 100, status: 'idle', socket, profile
      });
      room.status = "playing";
      room.currentTurnIndex = Math.random() < 0.5 ? 0 : 1;

      socket.join(roomId);
      io.to(roomId).emit("gameStarted");
      io.to(roomId).emit("gameState", getPublicGameState(room));
      io.to(roomId).emit("actionLog", "Battle started!");
    });

    socket.on("action", ({ roomId, actionType }) => {
      const room = battleRooms.get(roomId);
      if (!room || room.status !== "playing") return;

      const currentPlayer = room.players[room.currentTurnIndex];
      if (currentPlayer.id !== socket.id) return socket.emit("errorLog", "Not your turn!");

      const enemyIndex = (room.currentTurnIndex + 1) % 2;
      const enemyPlayer = room.players[enemyIndex];

      let actionLog = "";
      currentPlayer.status = 'idle';

      if (actionType === "attack") {
        let dmg = Math.floor(Math.random() * 11) + 10;
        if (enemyPlayer.status === "defending") { dmg = Math.floor(dmg / 2); enemyPlayer.status = "idle"; }
        enemyPlayer.hp = Math.max(0, enemyPlayer.hp - dmg);
        currentPlayer.energy = Math.min(currentPlayer.maxEnergy, currentPlayer.energy + 20);
        actionLog = `${currentPlayer.username} attacked for ${dmg} damage!`;
      } else if (actionType === "defend") {
        currentPlayer.status = "defending";
        currentPlayer.energy = Math.min(currentPlayer.maxEnergy, currentPlayer.energy + 30);
        actionLog = `${currentPlayer.username} is defending! (+30 Energy)`;
      } else if (actionType === "special") {
        if (currentPlayer.energy < 50) return socket.emit("errorLog", "Not enough energy!");
        currentPlayer.energy -= 50;
        let dmg = Math.floor(Math.random() * 16) + 25;
        if (enemyPlayer.status === "defending") { dmg = Math.floor(dmg / 2); enemyPlayer.status = "idle"; }
        enemyPlayer.hp = Math.max(0, enemyPlayer.hp - dmg);
        actionLog = `${currentPlayer.username} used SPECIAL and dealt ${dmg} damage!`;
      } else return;

      io.to(roomId).emit("actionLog", actionLog);

      if (enemyPlayer.hp <= 0) {
        room.status = "finished";
        room.winnerId = currentPlayer.id;
        io.to(roomId).emit("gameOver", { winnerUsername: currentPlayer.username, winnerId: currentPlayer.id });
      } else {
        room.currentTurnIndex = enemyIndex;
        if (room.isBotMatch && enemyIndex === 1) {
            handleBotTurn(roomId);
        }
      }

      io.to(roomId).emit("gameState", getPublicGameState(room));
    });

    socket.on("disconnect", () => {
      for (const [roomId, room] of battleRooms.entries()) {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          if (room.status === "playing") {
             const enemy = room.players[(playerIndex + 1) % 2];
             if (enemy) {
                 room.status = "finished";
                 room.winnerId = enemy.id;
                 io.to(roomId).emit("actionLog", `${room.players[playerIndex].username} disconnected.`);
                 io.to(roomId).emit("gameOver", { winnerUsername: enemy.username, winnerId: enemy.id, reason: "opponent_disconnected" });
             }
          }
          battleRooms.delete(roomId);
        }
      }
    });
  });

  // Simple JSON DB
  const DB_FILE = path.join(process.cwd(), "db.json");
  let db: { status_checks: any[], scores: any[] } = { status_checks: [], scores: [] };
  
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (e) {
      console.error("Could not read db.json", e);
    }
  }

  function saveDb() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db));
  }

  const apiRouter = express.Router();

  apiRouter.get("/", (req, res) => {
    res.json({ message: "Car Gamer API running" });
  });

  apiRouter.post("/status", (req, res) => {
    const statusObj = {
      id: crypto.randomUUID(),
      client_name: req.body.client_name,
      timestamp: new Date().toISOString()
    };
    db.status_checks.push(statusObj);
    saveDb();
    res.json(statusObj);
  });

  apiRouter.get("/status", (req, res) => {
    res.json(db.status_checks);
  });

  apiRouter.post("/scores", (req, res) => {
    const { player_name, score, distance, level, duration_seconds } = req.body;
    const scoreObj = {
      id: crypto.randomUUID(),
      player_name,
      score,
      distance,
      level,
      duration_seconds,
      created_at: new Date().toISOString()
    };
    db.scores.push(scoreObj);
    saveDb();
    res.json(scoreObj);
  });

  apiRouter.get("/scores", (req, res) => {
    const limitParam = parseInt(req.query.limit as string) || 10;
    const limit = Math.max(1, Math.min(limitParam, 50));
    
    // Sort descending by score
    const sortedScores = [...db.scores].sort((a, b) => b.score - a.score);
    res.json(sortedScores.slice(0, limit));
  });

  apiRouter.get("/scores/rank", (req, res) => {
    const score = parseInt(req.query.score as string);
    const higher = db.scores.filter(s => s.score > score).length;
    res.json({ rank: higher + 1, total: db.scores.length });
  });

  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
