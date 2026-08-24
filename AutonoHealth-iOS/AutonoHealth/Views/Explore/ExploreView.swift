import SwiftUI

struct ExploreView: View {
    @State private var query = ""

    private var matches: [HealthCondition] {
        guard !query.isEmpty else { return ConditionRepository.all }
        return ConditionRepository.all.filter {
            $0.name.localizedStandardContains(query) ||
            $0.category.localizedStandardContains(query) ||
            $0.summary.localizedStandardContains(query)
        }
    }

    var body: some View {
        List(matches) { condition in
            NavigationLink(value: condition) {
                HStack(spacing: 14) {
                    Image(systemName: condition.symbol)
                        .font(.title2)
                        .foregroundStyle(Brand.blue)
                        .frame(width: 36)
                    VStack(alignment: .leading, spacing: 4) {
                        Text(condition.name).font(.headline)
                        Text(condition.category).font(.caption).foregroundStyle(.secondary)
                        Text(condition.summary)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle("Explore")
        .searchable(text: $query, prompt: "Conditions and treatments")
        .navigationDestination(for: HealthCondition.self) { condition in
            ConditionDetailView(condition: condition)
        }
    }
}
