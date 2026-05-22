import { useStore } from '../store/useStore';
import type { Weather } from '../types/game';

export class WeatherManager {
  private static weatherTypes: Weather[] = ['clear', 'rain', 'snow', 'clouds'];

  public static update() {
    const { world } = useStore.getState();
    const now = Date.now();

    // Change weather every 2-6 hours
    const changeInterval = (2 + Math.random() * 4) * 60 * 60 * 1000;

    if (now - world.lastWeatherChange > changeInterval) {
      const newWeather = this.weatherTypes[Math.floor(Math.random() * this.weatherTypes.length)];

      useStore.setState((state) => ({
        world: {
          ...state.world,
          weather: newWeather,
          lastWeatherChange: now
        }
      }));

      useStore.getState().addJournalEntry(`The sky turned to ${newWeather}.`);
    }
  }
}
