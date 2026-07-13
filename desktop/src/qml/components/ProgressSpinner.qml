import QtQuick 2.15
import OllamoMUI 1.0

Item {
    id: root

    property bool running: false
    property color color: Theme.accentPrimary
    property real size: 24

    visible: running
    implicitWidth: size
    implicitHeight: size

    Rectangle {
        anchors.fill: parent
        radius: width / 2
        color: "#00000044"
        visible: root.running && root.opacity > 0
    }

    Canvas {
        id: canvas
        anchors.fill: parent
        visible: root.running

        onPaint: {
            var ctx = getContext("2d")
            ctx.clearRect(0, 0, width, height)
            ctx.strokeStyle = root.color
            ctx.lineWidth = width * 0.12
            ctx.lineCap = "round"
            ctx.beginPath()
            ctx.arc(width/2, height/2, width*0.35, 0, Math.PI * 1.5)
            ctx.stroke()
        }

        RotationAnimator {
            target: canvas
            from: 0
            to: 360
            duration: 800
            loops: Animation.Infinite
            running: root.running
        }
    }

    onRunningChanged: {
        if (running) {
            opacity = 1.0
            canvas.requestPaint()
        } else {
            opacity = 0.0
        }
    }
}
