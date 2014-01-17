@Ready @WEBAPP
Feature: Landing Page

  Background:
    Given I visit "Landing"

  Scenario: As a user I want to be able to sign in to my account from the landing page
    When I click "Sign In"
    Then The current page should be "Login"

  Scenario: As a user I want to be able to create a new account from the landing page
    When I click "Create Account"
    Then The current page should be "Registration"