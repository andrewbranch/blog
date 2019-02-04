workflow "New workflow" {
  on = "push"
  resolves = ["GitHub Action for AWS-1"]
}

action "install" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  args = "install"
}

action "build" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  args = "run build"
}

action "GitHub Action for AWS" {
  uses = "actions/aws/cli@aba0951d3bb681880614bbf0daa29b4a0c9d77b8"
  needs = ["build"]
  args = "s3 rm s3://blog.andrewbran.ch/beta --recursive"
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
}

action "GitHub Action for AWS-1" {
  uses = "actions/aws/cli@aba0951d3bb681880614bbf0daa29b4a0c9d77b8"
  needs = ["GitHub Action for AWS"]
  secrets = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
  args = "aws s3 cp public/ s3://blog.andrewbran.ch/beta/ --recursive --acl public-read"
}
