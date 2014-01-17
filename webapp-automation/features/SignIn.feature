@Ready @WEBAPP
Feature: Signing In

  Background:
    Given I visit "Login"
    
  Scenario: As a registered user, I want to successfully sign in with a phone number (07 format)
    And I enter "07896114213" into "Username"
    And I enter "tester" into "Password"
    When I click "Sign In Submit"
    Then The current page should be "Encounters"
    
  Scenario: As a registered user, I want to successfully sign in with a phone number (447 format)
    And I enter "447896114213" into "Username"
    And I enter "tester" into "Password"
    When I click "Sign In Submit"
    Then The current page should be "Encounters"

  Scenario: As a registered user, I want to successfully sign in with a phone number (+447 format)
    And I enter "+447896114213" into "Username"
    And I enter "tester" into "Password"
    When I click "Sign In Submit"
    Then The current page should be "Encounters"

  Scenario: As a registered user, I want to successfully sign in with a username
    And I enter "maddytest" into "Username"
    And I enter "tester" into "Password"
    When I click "Sign In Submit"
    Then The current page should be "Encounters"

  Scenario: As a registered user, I want to successfully sign in with an email address
    And I enter "chris.morris_t200@corp.badoo.com" into "Username"
    And I enter "tester" into "Password"
    When I click "Sign In Submit"
    Then The current page should be "Encounters"

  Scenario: As a user, I want to see an error when I don't enter any details
    And I click "Sign In Submit"
    Then I should see "Empty email or phone number error"

  Scenario: As a user, I want to see an error when I don't enter my password
    And I enter "chris.morris_t200@corp.badoo.com" into "Username"
    And I click "Sign In Submit"
    Then I should see "Empty password error"

  Scenario: As a user, I want to see an error when I don't enter my username
    And I enter "testaccount" into "Password"
    And I click "Sign In Submit"
    Then I should see "Empty email or phone number error"

  Scenario: As a user, I want to see an error when I enter invalid details
    And I enter "defguhselkfgjvhl" into "Username"
    And I enter "dfghfighkhg" into "Password"
    And I click "Sign In Submit"
    Then I should see "Invalid details error"

  Scenario: As a user who has forgotten my password I want to be able to visit the forgot password page
    And I click "Forgot Password Link"
    Then The current page should be "Forgot Password"
