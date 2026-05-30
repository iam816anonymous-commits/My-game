from playwright.sync_api import sync_playwright

def verify_ladders_v3_fixed():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        print("Navigating...")
        page.goto("http://localhost:5173", timeout=20000)

        # Click game
        page.get_by_text("Prism Ladders", exact=True).first.click()

        # Dismiss Onboarding
        print("Handling Onboarding...")
        page.wait_for_selector("text=Initiate Reality", timeout=10000)
        page.click("text=Initiate Reality")

        # Now in Lobby
        print("Handling Lobby...")
        page.wait_for_selector("text=STRATEGIC MOMENTUM SIMULATOR", timeout=10000)
        page.screenshot(path="verification/ladders_lobby_v3.png")

        # Custom Match
        page.click("text=Configure Custom Match")
        page.wait_for_selector("text=CUSTOM DEPLOYMENT", timeout=5000)
        page.screenshot(path="verification/ladders_custom_setup_v3.png")

        # Start
        page.click("text=Initiate Reality")

        # Board
        print("Verifying Board...")
        page.wait_for_selector("svg", timeout=10000)
        page.screenshot(path="verification/ladders_board_v3_final.png")

        # Turn
        page.click("text=Pulse Reality")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/ladders_preview_v3.png")

        browser.close()

if __name__ == "__main__":
    verify_ladders_v3_fixed()
