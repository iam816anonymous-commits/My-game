import * as PIXI from 'pixi.js';
import { useStore } from '../state/useStore';
import { EntityManager } from '../world/EntityManager';
import { Environment } from '../world/Environment';

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
    const { isStarted, isPaused, isGameOver, tick } = useStore.getState();

    if (!isStarted || isPaused || isGameOver) return;

    // Update global game state (energy decay)
    tick(delta);

    // Update game entities
    this.entityManager.update(delta);

    // Update environment visuals
    this.environment.update(delta);
  }

  public destroy() {
    this.entityManager.destroy();
    this.environment.destroy();
  }
}
