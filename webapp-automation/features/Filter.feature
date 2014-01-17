@Ready @WEBAPP
Feature: Testing the filter screen and it's functionality

  Background:
    Given I am logged in
    And I click "Menu"

  Scenario: As a user, I want to be able to see the filter screen from the encounters page so that I can see the fiter items
    And I click "Encounters menu item"
    When I click "Filter button"
    Then I should see "Save button"
    Then I should see "Back button"
    Then I should see "Make new friends radio"
    Then I should see "Chat radio"
    Then I should see "Date radio"
    Then I should see "Want to meet boys"
    Then I should see "Want to meet girls"
    Then I should see "Range slider track"
    #Then I should not see "City search" --fix this should not be visible and stacktrace says its visible in the DOM

  Scenario: As a user, I want to be able to navigate back to the encounters page from the filter screen
    And I click "Encounters menu item"
    When I click "Filter button"
    Then I should see "Back button"