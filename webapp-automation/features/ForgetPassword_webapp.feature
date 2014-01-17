@WEBAPP @Ready
Feature: Testing the forget password page for webapp

  Scenario: As a wap user, I want to be presented with an error message if I input incorrect details
    Given I visit "Forgot Password"
    And I enter "0101010" into "User"
    When I click "Get password"
    Then I should see "WEBAPP Error message container"

  Scenario: As a user, I want to be taken back to the login page when I cancel from the forget password page
    Given I visit "Forgot Password"
    When I click "Cancel"
    Then The current page should be "Login"