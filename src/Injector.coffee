ContainerManagement    = require "./ContainerManagement"
RegistrationManagement = require "./RegistrationManagement"
DependencyManagement   = require "./DependencyManagement"
Logger                 = require "./Logger"
Module                 = require "./Module"

class Injector extends Module

  @include ContainerManagement
  @include RegistrationManagement
  @include DependencyManagement

  constructor:(@name = "anonyous_injector", @logger = Logger.create())->
    super

  @create:(name, logger)->
    new Injector(name, logger)

module.exports = Injector
