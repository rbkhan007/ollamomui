import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15
import OllamoMUI 1.0

Rectangle {
    id: root

    property int currentIndex: 2
    property var pages: [
        { label: qsTr("Login"),      icon: "\u263A", section: "account" },
        { label: qsTr("Register"),   icon: "\u270E", section: "account" },
        { label: qsTr("Home"),       icon: "\u2302", section: "main" },
        { label: qsTr("Playground"), icon: "\u2699", section: "main" },
        { label: qsTr("Usage"),      icon: "\u2261", section: "main" },
        { label: qsTr("Memory"),     icon: "\u2749", section: "main" },
        { label: qsTr("RAG"),        icon: "\u2601", section: "main" },
        { label: qsTr("Settings"),   icon: "\u2692", section: "main" },
        { label: qsTr("License"),    icon: "\u2606", section: "main" },
        { label: qsTr("Terminal"),   icon: "\u23CE", section: "main" },
    ]

    signal pageSelected(int index)

    width: Theme.sidebarWidth
    color: Theme.bgSecondary

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: Theme.topBarHeight
            color: Theme.bgTertiary

            RowLayout {
                anchors.centerIn: parent
                spacing: 10

                Rectangle {
                    width: 32; height: 32; radius: 8
                    color: Theme.accentPrimary
                    Text {
                        anchors.centerIn: parent
                        text: "\u25B3"
                        color: "#ffffff"
                        font.pixelSize: 18
                        font.bold: true
                    }
                }

                Text {
                    text: qsTr("OllamoMUI")
                    font: Theme.fontHeading
                    font.pixelSize: 18
                    color: Theme.textPrimary
                }
            }
        }

        Item { Layout.preferredHeight: 20 }

        Repeater {
            model: root.pages

            Rectangle {
                id: itemDelegate
                property bool isActive: root.currentIndex === index
                property bool isSectionHeader: modelData.section !== undefined && (index === 0 || root.pages[index - 1].section !== modelData.section)

                visible: !(isSectionHeader && modelData.section === "account" && apiClient.token)

                Layout.fillWidth: true
                Layout.preferredHeight: isSectionHeader ? 36 : 44
                Layout.leftMargin: 8
                Layout.rightMargin: 8
                radius: Theme.radiusMedium
                color: isActive ? Theme.accentPrimary : "transparent"

                Behavior on color { ColorAnimation { duration: 150 } }

                RowLayout {
                    anchors.fill: parent
                    anchors.leftMargin: 12
                    anchors.rightMargin: 12
                    spacing: 12

                    Text {
                        text: modelData.icon
                        font.pixelSize: 18
                        color: isActive ? "#ffffff" : Theme.textSecondary
                    }

                    Text {
                        text: modelData.label
                        font: Theme.fontBody
                        font.pixelSize: 14
                        color: isActive ? "#ffffff" : Theme.textPrimary
                        Layout.fillWidth: true
                    }
                }

                HoverHandler {
                    cursorShape: Qt.PointingHandCursor
                }
                TapHandler {
                    onTapped: {
                        root.pageSelected(index)
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 1
            Layout.leftMargin: 12
            Layout.rightMargin: 12
            color: Theme.border
        }

        Item { Layout.preferredHeight: 4 }

        Item { Layout.fillHeight: true }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 48
            radius: Theme.radiusMedium
            Layout.leftMargin: 8
            Layout.rightMargin: 8
            color: "transparent"

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 12
                anchors.rightMargin: 12
                spacing: 12

                Text {
                    text: "\u263E"
                    font.pixelSize: 16
                    color: Theme.textSecondary
                }
                Text {
                    text: qsTr("Dark Mode")
                    font: Theme.fontBody
                    font.pixelSize: 13
                    color: Theme.textPrimary
                    Layout.fillWidth: true
                }
                ThemeSwitch { }
            }
        }

        Item { Layout.preferredHeight: 8 }
    }
}
