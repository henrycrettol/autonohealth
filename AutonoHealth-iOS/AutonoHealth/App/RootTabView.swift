import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
            }
            .tabItem { Label("Home", systemImage: "house") }

            NavigationStack {
                ExploreView()
            }
            .tabItem { Label("Explore", systemImage: "books.vertical") }

            NavigationStack {
                TrackerView()
            }
            .tabItem { Label("Track", systemImage: "chart.xyaxis.line") }

            NavigationStack {
                ToolsView()
            }
            .tabItem { Label("Tools", systemImage: "function") }

            NavigationStack {
                OttoView()
            }
            .tabItem { Label("Otto", systemImage: "message") }
        }
    }
}
