import SwiftUI

struct HomeView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Image("BrandLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: 230)
                    .accessibilityLabel("AutonoHealth")

                VStack(alignment: .leading, spacing: 12) {
                    Text("Understand your health with clarity.")
                        .font(.largeTitle.bold())
                        .foregroundStyle(Brand.navy)
                    Text("Evidence-aware guidance, useful tracking, and practical tools—built to help you prepare for better conversations with your healthcare team.")
                        .font(.title3)
                        .foregroundStyle(.secondary)
                }

                NavigationLink(value: ConditionRepository.featured) {
                    Label("Explore high blood pressure", systemImage: "heart.text.square")
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .brandCard()
                }
                .buttonStyle(.plain)

                VStack(alignment: .leading, spacing: 8) {
                    Label("Educational, not diagnostic", systemImage: "info.circle")
                        .font(.headline)
                    Text("AutonoHealth does not diagnose, prescribe, or replace care from a qualified healthcare professional.")
                        .foregroundStyle(.secondary)
                }
                .brandCard()
            }
            .padding()
        }
        .navigationTitle("Home")
        .navigationDestination(for: HealthCondition.self) { condition in
            ConditionDetailView(condition: condition)
        }
    }
}
