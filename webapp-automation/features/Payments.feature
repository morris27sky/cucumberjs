@Failing @WEBAPP
Feature: Testing the different payment process (SPP, Credits)

  Scenario: As a user, I want to be presented with the SPP payment options page from my profile screen
    Given I am logged in as a new user with no SPP
    And I click "Menu"
    And I click "Profile"
    When I click ".verify-source-spp"
    Then I should be on "/payment-options-page"
    And I should see "Activate Super Power now!"
    And I should see "Mobile phone bill"
    And I should see "Credit card"
    And I should see "PayPal"
    And I should see "Continue"

  Scenario: As a user, I want to be presented with the SPP payment options page from payment settings page
    Given I am logged in as a new user with no SPP
    And I click "Menu"
    And I click ".settings-page/menu"
    When I click "Payment settings"
    Then I should be on "/payment-options-page"
    And I should see "Activate Super Power now!"
    And I should see "Mobile phone bill"
    And I should see "Credit card"
    And I should see "PayPal"
    And I should see "Continue"

  Scenario: As a user, I want to be presented with the SPP payment options page from clicking to chat to a new users on badoo
    Given I create user two users
