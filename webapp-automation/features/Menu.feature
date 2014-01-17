@Ready @WEBAPP
Feature: Testing the left menu items and function

  Background:
    Given I am logged in
    And I click "Menu"

  Scenario: As a user, I want to see the menu items
    Then I should see "Profile menu item"
    Then I should see "People Nearby menu item"
    Then I should see "Encounters menu item"
    Then I should see "Photo Rating menu item"
    Then I should see "Your Connection"
    Then I should see "Messages menu item"
    Then I should see "Matches menu item"
    Then I should see "Profile visitors menu item"
    Then I should see "Favourites menu item"

  Scenario: As a user, I want to see the settings menu item
    Then I should see "Settings menu item"

  Scenario: As a user, I want to be able to visit my own profile page
    When I click "Profile menu item"
    Then The current page should be "Own Profile"

  Scenario: As a user, I want to be able to visit people nearby page
    When I click "People Nearby menu item"
    Then The current page should be "People Nearby"

  Scenario: As a user, I want to be able to visit encounters page
    When I click "Encounters menu item"
    Then The current page should be "Encounters"

  Scenario: As a user, I want to be able to visit photo rating page
    When I click "Photo Rating menu item"
    Then The current page should be "Photo Rating"

  Scenario: As a user, I want to be able to visit messages page
    When I click "Messages menu item"
    Then The current page should be "Messages"

  Scenario: As a user, I want to be able to visit matches/liked you page
    When I click "Matches menu item"
    Then The current page should be "Matches"

  Scenario: As a user, I want to be able to visit Profile visitors page
    When I click "Profile visitors menu item"
    Then The current page should be "Visitors"

  Scenario: As a user, I want to be able to visit favourites page
    When I click "Favourites menu item"
    Then The current page should be "Favourites"

  Scenario: As a user, I want to be able to visit settings page
    When I click "Settings menu item"
    Then The current page should be "Settings"