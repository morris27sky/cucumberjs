@WEBAPP @Ready @WAP
Feature: Testing the registration flow
@signup
  Scenario: As a user, I want to see an error when I input no data in the form fields
    Given I visit "Registration"
    When I click "Lets go!"
    Then I should see "Empty name error"
    And I should see "Empty gender error"
    And I should see "Empty date of birth error"
    And I should see "Empty city error"
    And I should see "What you are here for error"
@signup
  Scenario: As a user, I want to see an error when I input a single character in the name field
    Given I visit "Registration"
    And I enter "C" into "Name"
    When I click "Lets go!"
    Then I should see "Name too short error"
@signup
  Scenario: As a user, I want to see an error when I input a numeric character in the name field
    Given I visit "Registration"
    And I enter "1234" into "Name"
    When I click "Lets go!"
    Then I should see "Invalid name field error"

#fix selecting date
@Failing
  Scenario: As a user, I want to see an error if i set the birthday to be less than 18
    Given I visit "Registration"
    And I enter "01-01-2013" into "Birthday"
    When I click "Lets go!"
    Then I should see "18 years age restriction error"
@signup
  Scenario: As a user, I want to see an error if my email already in the system
    Given I visit "Registration"
    And I enter "chris.morris_t200@corp.badoo.com" into "Email"
    When I click "Lets go!"
    Then I should see "Email in system error"
#fix selecting date
@Failing
  Scenario: As a user, I want to see an error if input an invalid tel number
    Given I visit "Registration"
    And I enter "chris.morris_t0101@corp.badoo.com" into "Email"
    And I enter "chump" into "Name"
    And I enter "01-01-1981" into "Birthday"
    And I click "Gender male"
    And I enter "chat" into "Im here to"
    And I enter "London" into "City"
    And I click "Lets go!"
    And I enter "1010" into "Phone"
    When I click "Lets go!"
    Then I should see "Invalid cell phone error"
#fix selecting date
@Failing
  Scenario: As a user, I want to see a hidden container when I select im here to date from the drop down
    Given I visit "Registration"
    When I select "date" from "Im here to"
    Then I should see "Interested in element"
