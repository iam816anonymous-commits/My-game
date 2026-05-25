import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';
import { useTransientStore } from '../store/useTransientStore';
import { CompanionBrain } from './CompanionBrain';
import type { Scene } from '../types/game';
import { MessageSystem } from '../systems/MessageSystem';
import { RelicSystem } from '../systems/RelicSystem';

interface MemoryGraphic extends PIXI.Graphics {
  isRare?: boolean;
}

export class EntityManager {
  private app: PIXI.Application;
  private spirit: PIXI.Container;
  private memories: PIXI.Container;
  private world: PIXI.Container;
  private memoryPool: MemoryGraphic[] = [];
  private brain: CompanionBrain;
  private gates: PIXI.Container;

  constructor(app: PIXI.Application, world?: PIXI.Container) {
    this.app = app;

    if (world) {
        this.world = world;
    } else {
        this.world = new PIXI.Container();
        this.app.stage.addChild(this.world);
    }

    // PixiJS Spirit is now an invisible anchor for the 3D entity
    this.spirit = new PIXI.Container();
    this.spirit.x = app.screen.width / 2;
    this.spirit.y = app.screen.height / 2;
    this.app.stage.addChild(this.spirit);

    this.brain = new CompanionBrain(this.spirit, this.app);

    this.memories = new PIXI.Container();
    this.world.addChild(this.memories);

    this.gates = new PIXI.Container();
    this.world.addChild(this.gates);

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointerdown', this.onPointerDown);
  }

  private onPointerDown = (e: PIXI.FederatedPointerEvent) => {
    const { interact, world } = useStore.getState();
    interact();

    // Pulse mechanic: attract memories if energy > 20
    if (world.energy > 20) {
      this.createPulse(e.global.x, e.global.y);
    }

    this.createBurst(e.global.x, e.global.y);
  }

  private createPulse(x: number, y: number) {
    const pulse = new PIXI.Graphics();
    pulse.circle(0, 0, 1).stroke({ color: 0x67E8F9, width: 2, alpha: 0.8 });
    pulse.position.set(x, y);
    this.app.stage.addChild(pulse);

    const tick = (ticker: PIXI.Ticker) => {
        pulse.scale.set(pulse.scale.x + 0.1 * ticker.deltaTime);
        pulse.alpha -= 0.02 * ticker.deltaTime;

        // Attract memories
        this.memories.children.forEach((memory: any) => {
            const dx = pulse.x - (memory.x + this.world.x);
            const dy = pulse.y - (memory.y + this.world.y);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const range = pulse.scale.x * 50;

            if (dist < range && dist > 10) {
                memory.x += (dx / dist) * 5 * ticker.deltaTime;
                memory.y += (dy / dist) * 5 * ticker.deltaTime;
            }
        });

        if (pulse.alpha <= 0) {
            this.app.stage.removeChild(pulse);
            pulse.destroy();
            this.app.ticker.remove(tick);
        }
    };
    this.app.ticker.add(tick);
  }

  public update(delta: number) {
    this.brain.update(delta);

    // Camera/World Parallax Easing
    const targetWorldX = -(this.spirit.x - this.app.screen.width / 2) * 0.15;
    const targetWorldY = -(this.spirit.y - this.app.screen.height / 2) * 0.15;
    this.world.x += (targetWorldX - this.world.x) * 0.05 * delta;
    this.world.y += (targetWorldY - this.world.y) * 0.05 * delta;

    this.updateMemories(delta);
    this.updateGates(delta);

    // Sync PixiJS anchor position to transient store
    useTransientStore.getState().setCompanionPosition(this.spirit.x, this.spirit.y);
  }

  private updateMemories(delta: number) {
    if (Math.random() > 0.99) this.spawnMemory();
    if (Math.random() > 0.998) MessageSystem.spawnMessage(this.memories, (this.spirit.x - this.world.x) + (Math.random() - 0.5) * 1000, (this.spirit.y - this.world.y) + (Math.random() - 0.5) * 1000);
    if (Math.random() > 0.9995) RelicSystem.spawnRelic(this.memories, (this.spirit.x - this.world.x) + (Math.random() - 0.5) * 1200, (this.spirit.y - this.world.y) + (Math.random() - 0.5) * 1200);

    const children = [...this.memories.children] as MemoryGraphic[];
    children.forEach((memory) => {
      memory.rotation += 0.02 * delta;
      memory.y += Math.sin(Date.now() * 0.001 + memory.x) * 0.1;

      const dx = this.spirit.x - (memory.x + this.world.x);
      const dy = this.spirit.y - (memory.y + this.world.y);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 80) {
        this.collectMemory(memory);
      }
    });
  }

  private updateGates(delta: number) {
    if (this.gates.children.length < 1 && Math.random() > 0.999) this.spawnGate();

    this.gates.children.forEach((gate: any) => {
      gate.rotation += 0.01 * delta;
      gate.scale.set(1 + Math.sin(Date.now() * 0.002) * 0.1);

      const dx = this.spirit.x - (gate.x + this.world.x);
      const dy = this.spirit.y - (gate.y + this.world.y);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        const { setScene } = useStore.getState();
        setScene(gate.sceneType);
        this.gates.removeChild(gate);
      }
    });
  }

  private spawnGate() {
    const gate = new PIXI.Graphics() as any;
    const types: Scene[] = ['stardust', 'echoes', 'flow', 'orrery', 'logic', 'words', 'link', 'pairs'];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = type === 'stardust' ? 0x67E8F9 :
                  type === 'echoes' ? 0x8B5CF6 :
                  type === 'flow' ? 0xF9A8D4 :
                  type === 'orrery' ? 0xFDE68A :
                  type === 'logic' ? 0x67E8F9 :
                  type === 'words' ? 0x8B5CF6 :
                  type === 'pairs' ? 0xF9A8D4 : 0xffffff;

    gate.poly([0, -30, 25, 15, -25, 15]).stroke({ color, width: 2, alpha: 0.8 });
    gate.sceneType = type;

    const angle = Math.random() * Math.PI * 2;
    gate.x = (this.spirit.x - this.world.x) + Math.cos(angle) * 600;
    gate.y = (this.spirit.y - this.world.y) + Math.sin(angle) * 600;

    this.gates.addChild(gate);
  }

  private spawnMemory() {
    const isRare = Math.random() > 0.98;
    let memory = this.memoryPool.pop();
    if (!memory) memory = new PIXI.Graphics() as MemoryGraphic;

    memory.clear();
    memory.isRare = isRare;
    const color = isRare ? 0xFDE68A : 0x67E8F9;
    memory.poly([0, -8, 5, 0, 0, 8, -5, 0]).fill({ color, alpha: 0.7 });

    const angle = Math.random() * Math.PI * 2;
    const dist = 400 + Math.random() * 400;
    memory.x = (this.spirit.x - this.world.x) + Math.cos(angle) * dist;
    memory.y = (this.spirit.y - this.world.y) + Math.sin(angle) * dist;

    this.memories.addChild(memory);
  }

  private collectMemory(memory: MemoryGraphic) {
    const { addMemory } = useStore.getState();
    addMemory(memory.isRare ? 10 : 1);
    this.createBurst(memory.x + this.world.x, memory.y + this.world.y, memory.isRare ? 0xFDE68A : 0x67E8F9);
    this.applyScreenJuice();
    this.memories.removeChild(memory);
    this.memoryPool.push(memory);
  }

  private applyScreenJuice() {
    // Screen shake
    const ox = this.app.stage.x;
    const oy = this.app.stage.y;
    const shake = () => {
        this.app.stage.x = ox + (Math.random() - 0.5) * 4;
        this.app.stage.y = oy + (Math.random() - 0.5) * 4;
    };
    this.app.ticker.add(shake);
    setTimeout(() => {
        this.app.ticker.remove(shake);
        this.app.stage.x = ox;
        this.app.stage.y = oy;
    }, 100);
  }

  private particlePool: PIXI.Graphics[] = [];

  private createBurst(x: number, y: number, color: number = 0xffffff) {
    for (let i = 0; i < 8; i++) {
        let p = this.particlePool.pop();
        if (!p) p = new PIXI.Graphics();

        p.clear().circle(0, 0, 2).fill({ color, alpha: 0.8 });
        p.position.set(x, y);
        p.alpha = 1;
        this.app.stage.addChild(p);

        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 4;
        const vx = Math.cos(angle) * spd;
        const vy = Math.sin(angle) * spd;

        const tick = (ticker: PIXI.Ticker) => {
            p.x += vx * ticker.deltaTime;
            p.y += vy * ticker.deltaTime;
            p.alpha -= 0.02 * ticker.deltaTime;
            if (p.alpha <= 0) {
                this.app.stage.removeChild(p);
                this.particlePool.push(p);
                this.app.ticker.remove(tick);
            }
        };
        this.app.ticker.add(tick);
    }
  }

  public destroy() {
    this.app.stage.off('pointerdown', this.onPointerDown);
    this.spirit.destroy({ children: true });
    this.memories.destroy({ children: true });
    this.memoryPool.forEach(m => m.destroy());
    this.particlePool.forEach(p => p.destroy());
  }
}
