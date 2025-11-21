import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Activity, AlertCircle, Info } from "lucide-react";

const symptoms = [
  { id: 'fever', label: 'Fever' },
  { id: 'cough', label: 'Cough' },
  { id: 'cold', label: 'Cold/Runny Nose' },
  { id: 'headache', label: 'Headache' },
  { id: 'stomach-pain', label: 'Stomach Pain' },
  { id: 'vomiting', label: 'Vomiting' },
  { id: 'swelling', label: 'Swelling' },
  { id: 'rash', label: 'Rash/Skin Issues' },
  { id: 'body-ache', label: 'Body Ache' },
  { id: 'breathing', label: 'Breathing Difficulty' },
];

const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<{ condition: string; advice: string } | null>(null);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
    setDiagnosis(null);
  };

  const analyzSymptoms = () => {
    if (selectedSymptoms.length === 0) return;

    // Simple rule-based diagnosis
    const hasFever = selectedSymptoms.includes('fever');
    const hasCough = selectedSymptoms.includes('cough');
    const hasCold = selectedSymptoms.includes('cold');
    const hasStomach = selectedSymptoms.includes('stomach-pain');
    const hasVomiting = selectedSymptoms.includes('vomiting');
    const hasBreathing = selectedSymptoms.includes('breathing');

    if (hasBreathing) {
      setDiagnosis({
        condition: 'Breathing Issues - Urgent',
        advice: 'Please seek immediate medical attention. Book an emergency appointment or visit the nearest hospital.'
      });
    } else if (hasFever && hasCough && hasCold) {
      setDiagnosis({
        condition: 'Viral Fever / Flu',
        advice: 'Rest well, stay hydrated. Consider booking a consultation for proper medication. Paracetamol can help with fever.'
      });
    } else if (hasStomach && hasVomiting) {
      setDiagnosis({
        condition: 'Gastric Issue / Food Poisoning',
        advice: 'Stay hydrated with ORS. Avoid spicy food. Consult a doctor if symptoms persist beyond 24 hours.'
      });
    } else if (hasFever) {
      setDiagnosis({
        condition: 'Fever - General',
        advice: 'Monitor temperature. Take rest and fluids. Book a consultation if fever persists for more than 2 days.'
      });
    } else {
      setDiagnosis({
        condition: 'General Symptoms',
        advice: 'Monitor your symptoms. If they worsen or persist, please book an appointment with a doctor.'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Symptom Checker
        </CardTitle>
        <CardDescription>Select your symptoms to get preliminary guidance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="flex items-center space-x-2">
              <Checkbox
                id={symptom.id}
                checked={selectedSymptoms.includes(symptom.id)}
                onCheckedChange={() => toggleSymptom(symptom.id)}
              />
              <label
                htmlFor={symptom.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {symptom.label}
              </label>
            </div>
          ))}
        </div>

        <Button
          onClick={analyzSymptoms}
          disabled={selectedSymptoms.length === 0}
          className="w-full mb-4"
        >
          Analyze Symptoms
        </Button>

        {diagnosis && (
          <Alert>
            {diagnosis.condition.includes('Urgent') ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertTitle>{diagnosis.condition}</AlertTitle>
            <AlertDescription>{diagnosis.advice}</AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          * This is not a medical diagnosis. Always consult with a healthcare professional for proper treatment.
        </p>
      </CardContent>
    </Card>
  );
};

export default SymptomChecker;
