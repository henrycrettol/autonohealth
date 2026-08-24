import SwiftUI

struct ToolsView: View {
    @State private var feet = ""
    @State private var inches = ""
    @State private var pounds = ""

    private var bmi: Double? {
        guard let feet = Double(feet), let inches = Double(inches), let pounds = Double(pounds) else { return nil }
        let totalInches = feet * 12 + inches
        guard totalInches > 0, pounds > 0 else { return nil }
        return 703 * pounds / (totalInches * totalInches)
    }

    var body: some View {
        Form {
            Section("BMI estimate") {
                TextField("Feet", text: $feet).keyboardType(.numberPad)
                TextField("Inches", text: $inches).keyboardType(.decimalPad)
                TextField("Weight in pounds", text: $pounds).keyboardType(.decimalPad)
                if let bmi {
                    LabeledContent("Estimated BMI", value: bmi.formatted(.number.precision(.fractionLength(1))))
                        .font(.headline)
                }
            }

            Section {
                Text("BMI is a screening estimate, not a diagnosis. It does not account for every factor affecting health or body composition.")
            }
        }
        .navigationTitle("Tools")
    }
}
