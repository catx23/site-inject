@foo @simpleLogger
Feature: Simple Recorder


Background: Blank Page
  Given I am connected to an injected site
  Given A red box is shown

@debug
Scenario: Simple click event
  Given a black button
  When I click the resize button
  #When I click the animate button
  #Then I create 2000 mutations
  #Then I create 10 'div' elements
  #Then I create 1000 options
  Then I select the 10 option
  Then I wait 4 seconds
  Then I stop the recording session
  Then I wait 5 seconds
  Then I save the events
  Then I navigate away
  Then I wait 3 seconds
  Then I close the browser and exit
  #Given I am connected to the Dynatrace front-end
  #Then I navigated to User Sessions
  #Then I received my recorded session
