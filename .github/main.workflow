workflow "Build on push" {
  on = "push"
  resolves = ["build"]
}

action "install" {
  uses = "nuxt/actions-yarn@master"
  args = "install"
}

action "build" {
  needs = "install"
  uses = "nuxt/actions-yarn@master"
  args = "build"
}
