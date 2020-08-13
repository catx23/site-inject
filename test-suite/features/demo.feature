@foo @simpleLogger
Feature: Demo-Dev

Background: Demo-Dev Site
  Given I am logged into demo.dev
  #Given I am connected to a demo session at 'https://demo.dev.dynatracelabs.com/ui/user-sessions/-15365949870975JLV66GD73L5RMCAL3MA6RTU7UHIEAIJ/sessionreplay?gtf=l_24_HOURS&sessionId=1537530426321x1537530543623xWJKUKSFZNIABHPSXOYTIPJTNUKIVGBFI&id=-15365949870975JLV66GD73L5RMCAL3MA6RTU7UHIEAIJ&filtrfilterSReplay=1&filtrfilterApplication=APPLICATION-847ACCA54C9870FC&SHA=0'

@debug
Scenario: Network requests
  Given I have no request to 'blank.html'


#"cucumber": 
#"./node_modules/.bin/cucumber-js 
#features/**/*.feature 
#--logLevel=verbose 
#--require step-definitions/**/*.ts 
#--require hooks/**/*.ts  
#--require-module 
#ts-node/register 
#--format-options '{\"snippetInterface\": \"async-await\"}' 
#--format json:reports/cucumber-report.json 
#--format summary 
#--url='http://localhost:3030' 
#--dynatraceUrl='http://localhost:8020' 
#--close=false --headless=true",