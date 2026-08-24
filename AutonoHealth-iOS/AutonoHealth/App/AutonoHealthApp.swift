import SwiftUI

@main
struct AutonoHealthApp: App {
    @StateObject private var trackerStore = TrackerStore()

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environmentObject(trackerStore)
                .tint(Brand.blue)
        }
    }
}
