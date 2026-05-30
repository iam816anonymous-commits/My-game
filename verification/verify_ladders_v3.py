from playwright.sync_api import sync_playwright

def verify_snakes_ladders_v3():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        print("Navigating to Prism Ladders...")
        page.goto("http://localhost:5173", timeout=20000)
        page.wait_for_selector("text=Prism Ladders", timeout=15000)

        # Click the game card
        page.get_by_text("Prism Ladders", exact=True).first.click()

        # 1. Verify Lobby
        print("Verifying Lobby...")
        page.wait_for_selector("text=STRATEGIC MOMENTUM SIMULATOR", timeout=10000)
        page.screenshot(path="verification/ladders_lobby.png")

        # 2. Test Custom Match Config
        print("Testing Custom Match Configuration...")
        page.click("text=Configure Custom Match")
        page.wait_for_selector("text=CUSTOM DEPLOYMENT", timeout=5000)
        page.screenshot(path="verification/ladders_custom_setup.png")

        # Set slots
        # Slot 2 to AI, Slot 3 to AI
        page.locator("div").filter(has_text="2").locator("button").filter(has_text="ai").click()
        page.locator("div").filter(has_text="3").locator("button").filter(has_text="ai").click()

        # 3. Start Game
        print("Initiating Game...")
        page.click("text=Initiate Reality")

        # 4. Wait for Onboarding if present (though it might be skipped if already marked seen in store,
        # but store is reset on reload usually unless persistence works)
        try:
            page.wait_for_selector("text=INITIATE REALITY", timeout=3000)
            page.click("text=INITIATE REALITY")
        except:
            pass

        # 5. Verify Board Visuals
        print("Verifying Board Rendering...")
        page.wait_for_selector("svg", timeout=10000)
        page.screenshot(path="verification/ladders_board_v3.png")

        # 6. Execute Move & Verify Preview
        print("Executing Turn...")
        page.click("text=Pulse Reality")

        # Wait for the preview highlight (should appear within 1s)
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/ladders_movement_preview.png")

        # Wait for movement to finish (approx 3-5s depending on roll)
        page.wait_for_timeout(5000)
        page.screenshot(path="verification/ladders_post_move.png")

        browser.close()

if __name__ == "__main__":
    verify_snakes_ladders_v3()
