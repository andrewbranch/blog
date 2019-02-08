workflow "Deploy production" {
  on = "release"
  resolves = ["deploy"]
}

action "install" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  args = "install aws-sdk@2.395"
}

action "deploy" {
  needs = ["install"]
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  args = "run deploy:production"
}