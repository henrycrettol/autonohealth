import SwiftUI

struct TrackerView: View {
    @EnvironmentObject private var store: TrackerStore
    @State private var showingClearConfirmation = false

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Today")
                            .font(.title2.bold())
                        Spacer()
                        Text("\(store.completedCount) of \(store.items.count)")
                            .foregroundStyle(.secondary)
                    }
                    ProgressView(value: store.completion)
                        .tint(store.completion == 1 ? Brand.green : Brand.blue)
                    Text(store.completion == 1 ? "Check-in complete" : "Values save automatically on this device.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 6)
            }

            Section("Daily check-in") {
                ForEach(store.items) { item in
                    TrackerRow(item: item)
                }
            }

            Section {
                Button("Clear today", role: .destructive) {
                    showingClearConfirmation = true
                }
            } footer: {
                Text("This first native build stores tracker data locally with iOS file protection. Account sync will be added in the Firebase phase.")
            }
        }
        .navigationTitle("Track")
        .confirmationDialog("Clear today's check-in?", isPresented: $showingClearConfirmation) {
            Button("Clear Today", role: .destructive) { store.clearToday() }
        }
    }
}

private struct TrackerRow: View {
    @EnvironmentObject private var store: TrackerStore
    let item: TrackerItem

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label {
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.label).font(.headline)
                    Text(item.detail).font(.caption).foregroundStyle(.secondary)
                }
            } icon: {
                Image(systemName: item.symbol).foregroundStyle(Brand.blue)
            }

            input
        }
        .padding(.vertical, 4)
    }

    @ViewBuilder
    private var input: some View {
        switch item.kind {
        case .mood:
            Picker("Mood", selection: binding(defaultValue: "")) {
                Text("Not set").tag("")
                ForEach(1...5, id: \.self) { level in
                    Text("\(level)").tag(String(level))
                }
            }
            .pickerStyle(.segmented)

        case .hours:
            Stepper(value: numericBinding(defaultValue: 7.5), in: 3...11, step: 0.5) {
                let value = numericBinding(defaultValue: 7.5).wrappedValue
                Text(store.value(for: item).isEmpty ? "Not set" : "\(value, specifier: "%.1f") hr")
            }

        case .number:
            HStack {
                TextField("0", text: binding(defaultValue: ""))
                    .keyboardType(.decimalPad)
                if let unit = item.unit {
                    Text(unit).foregroundStyle(.secondary)
                }
            }

        case .yesNo:
            Picker(item.label, selection: binding(defaultValue: "")) {
                Text("Not set").tag("")
                Text("Yes").tag("yes")
                Text("No").tag("no")
            }
            .pickerStyle(.segmented)

        case .note:
            TextField("Add a note", text: binding(defaultValue: ""), axis: .vertical)
                .lineLimit(1...3)
        }
    }

    private func binding(defaultValue: String) -> Binding<String> {
        Binding(
            get: { store.value(for: item).isEmpty ? defaultValue : store.value(for: item) },
            set: { store.setValue($0, for: item) }
        )
    }

    private func numericBinding(defaultValue: Double) -> Binding<Double> {
        Binding(
            get: { Double(store.value(for: item)) ?? defaultValue },
            set: { store.setValue(String($0), for: item) }
        )
    }
}
