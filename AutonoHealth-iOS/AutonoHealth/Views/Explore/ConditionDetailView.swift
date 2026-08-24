import SwiftUI

struct ConditionDetailView: View {
    let condition: HealthCondition

    var body: some View {
        List {
            Section {
                Label(condition.category, systemImage: condition.symbol)
                    .foregroundStyle(Brand.blue)
                Text(condition.summary)
                    .font(.title3)
            }

            DetailSection(title: "What it is", text: condition.overview)
            DetailSection(title: "What people may notice", text: condition.symptoms)

            Section("When to get urgent help") {
                Label {
                    Text(condition.urgentHelp)
                } icon: {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.red)
                }
            }

            DetailSection(title: "Useful tracking", text: condition.usefulTracking)

            Section("Evidence snapshots") {
                ForEach(condition.evidence) { item in
                    VStack(alignment: .leading, spacing: 7) {
                        HStack(alignment: .firstTextBaseline) {
                            Text(item.approach).font(.headline)
                            Spacer()
                            EvidenceBadge(rating: item.rating)
                        }
                        Text(item.meaning)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }

            Section("Sources") {
                ForEach(condition.sources) { source in
                    Link(destination: source.url) {
                        Label(source.title, systemImage: "arrow.up.right.square")
                    }
                }
                Text("Reviewed July 2026")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle(condition.name)
        .navigationBarTitleDisplayMode(.large)
    }
}

private struct DetailSection: View {
    let title: String
    let text: String

    var body: some View {
        Section(title) { Text(text) }
    }
}

private struct EvidenceBadge: View {
    let rating: EvidenceRating

    var color: Color {
        switch rating {
        case .strong: Brand.green
        case .moderate: Brand.blue
        case .limited: .orange
        case .insufficient: .secondary
        }
    }

    var body: some View {
        Text(rating.rawValue)
            .font(.caption.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .foregroundStyle(color)
            .background(color.opacity(0.12), in: Capsule())
    }
}
