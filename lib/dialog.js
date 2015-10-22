'use strict'

const Lo = require('lodash')
const dialog = require('dialog')
const Docker = require('./docker')
const Menu = require('./menu')

const MACHINE_TEMPLATE = Lo.template('Driver: <%= DRIVER %>\nURL: <%= URL %>\nState: <%= STATE %>')
const CONTAINER_TEMPLATE = Lo.template('Image: <%= Image %>\nCommand: <%= Command %>\nStatus: <%= Status %>\nPorts: <%= Portmaps %>')

exports.showMachineActions = function (machine) {
  let buttons = machine.isRunning ? ['Stop', 'Kill', 'Cancel'] : ['Start', 'Remove', 'Cancel']
  dialog.showMessageBox({
    title: machine.NAME,
    message: machine.NAME,
    detail: MACHINE_TEMPLATE(machine),
    type: 'info',
    buttons: buttons,
    noLink: true
  }, function (actionIndex) {
    switch (buttons[actionIndex]) {
      case 'Stop':
        Docker.stopMachine(machine).then(Menu.rebuildNow)
        break
      case 'Start':
        Docker.startMachine(machine).then(Menu.rebuildNow)
        break
      case 'Kill':
        Docker.killMachine(machine).then(Menu.rebuildNow)
        break
      case 'Remove':
        Docker.removeMachine(machine).then(Menu.rebuildNow)
        break
    }
  })
}

exports.showContainerActions = function (machine, container) {
  let buttons = container.isRunning ? ['Stop', 'Kill', 'Cancel'] : ['Start', 'Remove', 'Cancel']
  let ports = container.Ports.map(function (port) {
    return `${port.Type}/${port.PrivatePort}:${port.PublicPort || '-'}`
  }).join(', ')
  container.Portmaps = ports
  dialog.showMessageBox({
    title: container.bestName,
    message: container.bestName,
    detail: CONTAINER_TEMPLATE(container),
    type: 'info',
    buttons: buttons,
    noLink: true
  }, function (actionIndex) {
    Docker.getContainer(machine, container).then(function (containerInstance) {
      switch (buttons[actionIndex]) {
        case 'Stop':
          containerInstance.stop(Menu.rebuildNow)
          break
        case 'Start':
          containerInstance.start(Menu.rebuildNow)
          break
        case 'Remove':
          containerInstance.remove(Menu.rebuildNow)
          break
        case 'Kill':
          containerInstance.kill(Menu.rebuildNow)
          break
      }
    })
  })
}