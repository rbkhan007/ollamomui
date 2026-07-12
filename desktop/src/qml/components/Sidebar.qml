import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15

Rectangle {
    id: root

    property int currentIndex: 2  // default to Home
    property var pages: [
        { label: "Login",      icon: "\u263A", section: "account" },
        { label: "Register",   icon: "\u270E", section: "account" },
        { label: "Home",       icon: "\u2302", section: "main" },
        { label: "Playground", icon: "\u2699", section: "main" },
        { label: "Usage",      icon: "\u2261", section: "main" },
        { label: "Memory",     icon: "\u2749", section: "main" },
        { label: "RAG",        icon: "\u2601", section: "main" },
        { label: "Settings",   icon: "\u2692", section: "main" },
        { label: "License",    icon: "\u2606", section: "main" },
        { label: "Terminal",   icon: "\u23CE", section: "main" },
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
                    text: "OllamoMUI"
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

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onEntered: if (!isActive) parent.color = Theme.surfaceAlt
                    onExited: if (!isActive) parent.color = "transparent"
                    onClicked: {
                        root.currentIndex = index
                        root.pageSelected(index)
                    }
                }
            }
        }

        // Section separator
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
            color: "transparent"
            Layout.leftMargin: 8
            Layout.rightMargin: 8

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 12
                anchors.rightMargin: 12
                spacing: 8

                Text {
                    text: themeManager.darkTheme ? "\u2600" : "\u2601"
                    font.pixelSize: 16
                    color: Theme.textSecondary
                }
                Text {
                    text: "Theme"
                    font: Theme.fontBody
                    color: Theme.textPrimary
                    Layout.fillWidth: true
                }
                ThemeSwitch { }
            }
        }

        Item { Layout.preferredHeight: 8 }
    }
}
