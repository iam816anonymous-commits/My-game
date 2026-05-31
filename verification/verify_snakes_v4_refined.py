import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})

        # 1. Navigate to the game
        await page.goto("http://localhost:5173")
        print("Navigated to home")
        await asyncio.sleep(5)

        # Take a screenshot to see where we are
        await page.screenshot(path="verification/home_debug.png")

        # 2. Try to find the Prism Ladders button by text
        # The button might not have a role "button" if it's a div or something else
        try:
            await page.get_by_text("Prism Ladders").click()
            print("Clicked Prism Ladders (by text)")
        except:
            print("Failed to click by text, trying locator")
            await page.locator("text=Prism Ladders").first.click()
            print("Clicked Prism Ladders (by locator)")

        await asyncio.sleep(2)

        # 3. Onboarding screen - find "INITIATE REALITY"
        # The debug screenshot showed it was visible
        await page.get_by_text("INITIATE REALITY").first.click()
        print("Clicked onboarding 'Initiate Reality'")
        await asyncio.sleep(2)
        await page.screenshot(path="verification/snakes_after_onboarding.png")

        # 4. Lobby screen - click it again
        await page.get_by_text("INITIATE REALITY").last.click()
        print("Clicked lobby 'Initiate Reality'")
        await asyncio.sleep(2)
        await page.screenshot(path="verification/snakes_after_lobby.png")

        # 5. Game Screen - Pulse Reality
        await page.get_by_text("Pulse Reality").first.click()
        print("Clicked Pulse Reality")

        # 6. Wait for movement and take a screenshot of the board
        await asyncio.sleep(5)
        await page.screenshot(path="verification/snakes_gameplay_v4.png")
        print("Screenshot saved to verification/snakes_gameplay_v4.png")

        await browser.close()

if __name__ == "__main__":
    os.makedirs("verification", exist_ok=True)
    asyncio.run(run())
