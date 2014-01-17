@Ready @WAP
Feature: Testing the registration flow
@signup
  Scenario: As a user, I want to see an error when I input no data in the form fields
    Given I visit "Registration"
    When I click "Lets go!"
    Then I should see "Empty name error"
    And I should see "Empty gender error"
    And I should see "What you are here for error"

@signup
  Scenario: As a user, I want to see an error if my email already in the system
    Given I visit "Registration"
    And I enter "chris.morris_t200@corp.badoo.com" into "Email"
    When I click "Lets go!"
    Then I should see "Email in system error"