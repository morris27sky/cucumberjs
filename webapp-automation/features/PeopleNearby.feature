@WEBAPP @Ready
Feature: Testing the people nearby page and its components

  Background:
    Given I visit "Login"

  Scenario: As an authenticated user, I want to see the spotlight item so that I can view other users
    And I enter "morris27sky" into "Username"
    And I enter "tester" into "Password"
    And I click "Sign In Submit"
    And I click "Menu"
    When I click "People Nearby menu item"
    Then I should see "Spotlight section"
    And I should see "Add me here button"

  Scenario: As an authenticated user that clicks the add me here button, I want be shown the spotlight into page so that I can promote myself on spotlight
    And I enter "morris27sky" into "Username"
    And I enter "tester" into "Password"
    And I click "Sign In Submit"
    And I click "Menu"
    And I click "People Nearby menu item"
    When I click "Add me here button"
    Then The current page should be "Spotlight Intro"
    And I should see "Go!"
    When I click "Back button"
    Then The current page should be "People Nearby"