const THREE = require('three')
window.THREE = window.THREE || THREE

const { useRef } = React = require('react')
const { useRender } = require('react-three-fiber')

const { log } = require('../components/Log')

let THRESHOLD = 0.09

function useControllerTracking (controllers, onDrum) {
  const targets = useRef()
  const getTargets = () => {
    if (targets.current == null) {
      targets.current = {}
    }
    return targets.current
  }

  useRender((state, delta) => {
    controllers.forEach(controller => {
      if (getTargets()[controller.uuid] == null) {
        getTargets()[controller.uuid] = {
          controller,
          acc: new THREE.Vector3(),
          accD: new THREE.Vector3(),
          accF: new THREE.Vector3(),
          prev: null
        }
      }

      let target = getTargets()[controller.uuid]

      if (target.prev) {
        let d = target.controller.position.clone().sub(target.prev)
        target.acc.add(d)
        target.accD.add(d)
        target.accF.add(d)

        let l = -Number.MAX_SAFE_INTEGER
        let c
        for (let i = 0; i < 3; i++) {
          if (target.accD.getComponent(i) > l) {
            l = target.accD[i]
            c = i
          }
        }
        let mc = target.accD.getComponent(c)
        let dc = d.getComponent(c)

        let signsEq = Math.sign(mc) == Math.sign(dc)

        let len = target.accD.length()

        if (len > THRESHOLD && !signsEq) {
          log(`DRUM! ${Date.now()}`)

          target.acc.set(0, 0, 0)
          target.accD.set(0, 0, 0)
          target.accF.set(0, 0, 0)
        }

        target.accD.multiplyScalar(0.98)
        target.accF.multiplyScalar(0.2)
      }

      target.prev = target.controller.position.clone()
    })
  }, false, [controllers])
}

module.exports = useControllerTracking
