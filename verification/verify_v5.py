import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})

        # Prism Ladders
        await page.goto("http://localhost:5173")
        await asyncio.sleep(3)
        await page.get_by_text("Prism Ladders").click()
        await asyncio.sleep(2)
        await page.get_by_text("INITIATE REALITY").first.click()
        await asyncio.sleep(2)
        await page.get_by_text("INITIATE REALITY").last.click()
        await asyncio.sleep(5)
        await page.screenshot(path="verification/v5_snakes_layout.png")
        print("Captured Prism Ladders V5 Layout")

        # Neon Ludo
        await page.goto("http://localhost:5173")
        await asyncio.sleep(3)
        await page.get_by_text("Neon Ludo").click()
        await asyncio.sleep(2)
        await page.get_by_text("INITIATE REALITY").first.click()
        await asyncio.sleep(2)

        # Take a screenshot to see why Initialize Core isn't found
        await page.screenshot(path="verification/ludo_lobby_debug.png")

        # The button might be uppercase or have different text now
        try:
            await page.get_by_text("Initialize Core", exact=False).click()
        except:
            await page.get_by_role("button").last.click()

        await asyncio.sleep(2)
        await page.get_by_text("HUMAN", exact=False).first.click()
        print("Enabled Ludo Simulation Mode")
        await asyncio.sleep(15)

        await page.screenshot(path="verification/v5_ludo_hub.png")
        print("Captured Neon Ludo V5 Layout and Hub")

        await browser.close()

if __name__ == "__main__":
    os.makedirs("verification", exist_ok=True)
    asyncio.run(run())
