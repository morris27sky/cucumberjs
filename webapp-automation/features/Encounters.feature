@WEBAPP @WAP @Ready
Feature: Testing that the user is shown the encounters page after signing in

  Scenario: As an authenticated user, I want to be presented with the encounter page after sign in
    Given I am logged in
    Then The current page should be "Encounters"

  Scenario: As an authenticated user with a good profile pic, I want to be able to see the vote buttons so that I can vote
    Given I visit "Login"
    And I enter "chrissytest" into "Username"
    And I enter "tester" into "Password"
    And I click "Sign In Submit"
    And I click "Menu"
    When I click "Encounters menu item"
    Then I should see "Yes button"
    And I should see "No button"
    And I should see "Profile info button"
    And I should see "Friends stats"
    And I should see "Interests stats"
    When I click "No button"
    Then The current page should be "Encounters"
    When I click "Yes button"
    Then The current page should be "Encounters"
 
  Scenario: As an authenticated user with a moderated profile pic, I should be shown the add photo screen
    Given I visit "Login"
    And I enter "maddytest" into "Username"
    And I enter "tester" into "Password"
    And I click "Sign In Submit"
    And I wait for 2 seconds
    When I click "Yes button"
    And I wait for 2 seconds
    Then The current page should be "Add Photo"