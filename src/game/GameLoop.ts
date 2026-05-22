import * as PIXI from 'pixi.js';
import { useStore } from '../store/useStore';
import { EntityManager } from '../companion/EntityManager';
import { Environment } from '../world/WorldProgressionManager';
import { EventSystem } from '../events/EventSystem';

export class GameLoop {
  private app: PIXI.Application;
  private entityManager: EntityManager;
  private environment: Environment;
  private world: PIXI.Container;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);

    this.entityManager = new EntityManager(app, this.world);
    this.environment = new Environment(app, this.world);

    this.app.ticker.add(this.update.bind(this));
  }

  private update(ticker: PIXI.Ticker) {
    const delta = ticker.deltaTime;
    const now = Date.now();
    const { isStarted, isPaused, isGameOver, tick } = useStore.getState();

    if (!isStarted || isPaused || isGameOver) return;

    // Update global game state
    tick(delta, now);

    // Update game entities
    this.entityManager.update(delta);

    // Update environment visuals
    this.environment.update(delta);

    // Update random events
    EventSystem.update(delta);
  }

  public destroy() {
    this.entityManager.destroy();
    this.environment.destroy();
  }
}
