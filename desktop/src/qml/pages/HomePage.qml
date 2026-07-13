import QtQuick 2.15
import QtQuick.Layouts 1.15
import QtQuick.Controls 2.15
import OllamoMUI 1.0

Rectangle {
    color: "transparent"

    Flickable {
        anchors.fill: parent
        contentHeight: contentColumn.height + 80
        clip: true
        boundsBehavior: Flickable.StopAtBounds

        ColumnLayout {
            id: contentColumn
            width: parent.width - 80
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: 30

            Item { Layout.preferredHeight: 40 }

            GradientText {
                Layout.fillWidth: true
                fontSize: 36
                text: qsTr("Welcome to OllamoMUI")
                horizontalAlignment: Text.AlignHCenter
            }

            Text {
                Layout.fillWidth: true
                text: qsTr("Your local AI playground with PostgreSQL-powered memory & RAG")
                font: Theme.fontBody
                font.pixelSize: 16
                color: Theme.textSecondary
                horizontalAlignment: Text.AlignHCenter
                wrapMode: Text.WordWrap
            }

            Item { Layout.preferredHeight: 20 }

            GridLayout {
                Layout.fillWidth: true
                columns: 3
                columnSpacing: 20
                rowSpacing: 20

                FeatureCard {
                    title: qsTr("Chat Playground")
                    description: "Interact with local language models through a modern chat interface with streaming responses."
                    icon: "\u2699"
                    Layout.fillWidth: true
                }

                FeatureCard {
                    title: qsTr("Memory")
                    description: "Persistent conversation memory with PostgreSQL-backed semantic search and recall."
                    icon: "\u2749"
                    Layout.fillWidth: true
                }

                FeatureCard {
                    title: qsTr("RAG Engine")
                    description: "Retrieval-Augmented Generation with pgvector, TF-IDF, and hybrid search."
                    icon: "\u2601"
                    Layout.fillWidth: true
                }

                FeatureCard {
                    title: qsTr("Usage Analytics")
                    description: "Track token usage, request counts, and model performance metrics."
                    icon: "\u2261"
                    Layout.fillWidth: true
                }

                FeatureCard {
                    title: qsTr("Model Catalog")
                    description: "Browse and manage available models with auto-detection and metadata."
                    icon: "\u2630"
                    Layout.fillWidth: true
                }

                FeatureCard {
                    title: qsTr("API Compatible")
                    description: "Drop-in OpenAI-compatible API at /v1/chat/completions for any existing tooling."
                    icon: "\u21C4"
                    Layout.fillWidth: true
                }
            }

            Item { Layout.preferredHeight: 20 }

            RowLayout {
                Layout.fillWidth: true
                Layout.alignment: Qt.AlignHCenter
                spacing: 16

                Button {
                    text: qsTr("Launch Playground")
                    flat: true
                    implicitWidth: 200
                    implicitHeight: 44
                    contentItem: Text {
                        text: parent.text
                        color: "#ffffff"
                        font: Theme.fontBody
                        font.pixelSize: 14
                        font.bold: true
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                    }
                    background: Rectangle {
                        radius: Theme.radiusMedium
                        gradient: Gradient {
                            GradientStop { position: 0.0; color: Theme.accentPrimary }
                            GradientStop { position: 1.0; color: Theme.accentSecondary }
                        }
                    }
                    onClicked: {
                        var sidebarObj = window.findChild("sidebar")
                        if (sidebarObj) sidebarObj.currentIndex = 3
                        stackLayout.currentIndex = 3
                    }
                }

                Button {
                    text: qsTr("View on GitHub")
                    flat: true
                    implicitWidth: 200
                    implicitHeight: 44
                    contentItem: Text {
                        text: parent.text
                        color: Theme.accentPrimary
                        font: Theme.fontBody
                        font.pixelSize: 14
                        font.bold: true
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                    }
                    background: Rectangle {
                        radius: Theme.radiusMedium
                        border.color: Theme.accentPrimary
                        border.width: 1
                        color: "transparent"
                    }
                    onClicked: Qt.openUrlExternally("https://github.com/rbkhan007/ollamomui")
                }
            }
        }
    }
}
