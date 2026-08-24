import SwiftUI

struct OttoView: View {
    var body: some View {
        ContentUnavailableView {
            Label("Otto is next", systemImage: "message")
        } description: {
            Text("The native conversation interface and existing server-side model proxy will be connected in the next integration phase.")
        } actions: {
            NavigationLink("Explore health information", value: ConditionRepository.featured)
                .buttonStyle(.borderedProminent)
        }
        .navigationTitle("Otto")
        .navigationDestination(for: HealthCondition.self) { condition in
            ConditionDetailView(condition: condition)
        }
    }
}
