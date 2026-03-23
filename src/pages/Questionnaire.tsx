import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Activity, ArrowLeft, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Questionnaire = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    familyDiabetes: "",
    familyHypertension: "",
    familyObesity: "",
    smokingStatus: "",
    alcoholConsumption: "",
    exerciseFrequency: "",
    dietType: "",
    sleepHours: "",
    pastIllnesses: [] as string[],
    currentSymptoms: [] as string[],
    location: "",
    allergies: [] as string[],
  });

  // Predefined options
  const illnessOptions = [
    "Diabetes", "Hypertension", "Heart Disease", "Asthma", "Thyroid Disorder",
    "Cancer", "Tuberculosis", "Hepatitis", "Kidney Disease", "Arthritis"
  ];
  
  const symptomOptions = [
    "Fatigue", "Headache", "Chest Pain", "Shortness of Breath", "Dizziness",
    "Nausea", "Fever", "Weight Loss", "Weight Gain", "Joint Pain"
  ];
  
  const locationOptions = [
    "Kanpur", "Lucknow", "Agra", "Varanasi", "Allahabad", "Meerut",
    "Ghaziabad", "Noida", "Delhi", "Mumbai", "Pune", "Bangalore"
  ];
  
  const allergyOptions = [
    "Peanuts", "Tree Nuts", "Milk", "Eggs", "Soy", "Wheat",
    "Fish", "Shellfish", "Pollen", "Dust", "Pet Dander", "Penicillin"
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const height = parseFloat(formData.height) / 100; // Convert cm to meters
      const weight = parseFloat(formData.weight);
      const bmi = weight / (height * height);

      // Simple risk calculation (placeholder for ML model)
      const diabetesRisk = calculateDiabetesRisk(formData, bmi);
      const obesityRisk = calculateObesityRisk(bmi, formData);
      const hypertensionRisk = calculateHypertensionRisk(formData, bmi);

      const { data: insertedData, error } = await supabase.from("health_assessments").insert({
        user_id: user.id,
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        bmi,
        family_diabetes: formData.familyDiabetes === "yes",
        family_hypertension: formData.familyHypertension === "yes",
        family_obesity: formData.familyObesity === "yes",
        smoking_status: formData.smokingStatus,
        alcohol_consumption: formData.alcoholConsumption,
        exercise_frequency: formData.exerciseFrequency,
        diet_type: formData.dietType,
        sleep_hours: parseInt(formData.sleepHours),
        diabetes_risk: diabetesRisk,
        obesity_risk: obesityRisk,
        hypertension_risk: hypertensionRisk,
        past_illnesses: formData.pastIllnesses,
        current_symptoms: formData.currentSymptoms,
        location: formData.location,
        allergies: formData.allergies,
      }).select().single();

      if (error) throw error;

      // Generate report using Tongyi API
      try {
        const { data: reportData, error: reportError } = await supabase.functions.invoke('generate-assessment-report', {
          body: {
            assessmentData: {
              age: parseInt(formData.age),
              gender: formData.gender,
              height: parseFloat(formData.height),
              weight: parseFloat(formData.weight),
              bmi,
              family_diabetes: formData.familyDiabetes === "yes",
              family_hypertension: formData.familyHypertension === "yes",
              family_obesity: formData.familyObesity === "yes",
              smoking_status: formData.smokingStatus,
              alcohol_consumption: formData.alcoholConsumption,
              exercise_frequency: formData.exerciseFrequency,
              diet_type: formData.dietType,
              sleep_hours: parseInt(formData.sleepHours),
              diabetes_risk: diabetesRisk,
              obesity_risk: obesityRisk,
              hypertension_risk: hypertensionRisk,
              past_illnesses: formData.pastIllnesses,
              current_symptoms: formData.currentSymptoms,
              location: formData.location,
              allergies: formData.allergies,
            },
            api: 'tongyi'
          }
        });

        if (reportError) {
          console.error('Report generation error:', reportError);
          // Continue to dashboard even if report generation fails
        } else {
          console.log('Report generated successfully:', reportData);
        }
      } catch (reportGenError) {
        console.error('Failed to generate report:', reportGenError);
        // Continue to dashboard even if report generation fails
      }

      toast({
        title: "Assessment Complete!",
        description: "Generating your personalized health report...",
      });
      navigate(`/assessment-report?id=${insertedData.id}`, { state: { assessmentId: insertedData.id } });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDiabetesRisk = (data: any, bmi: number): number => {
    let risk = 0;
    if (bmi > 30) risk += 30;
    else if (bmi > 25) risk += 20;
    if (data.familyDiabetes === "yes") risk += 25;
    if (data.exerciseFrequency === "never") risk += 15;
    if (data.age && parseInt(data.age) > 45) risk += 10;
    return Math.min(risk, 100);
  };

  const calculateObesityRisk = (bmi: number, data: any): number => {
    let risk = 0;
    if (bmi > 30) risk = 80;
    else if (bmi > 25) risk = 50;
    else if (bmi > 18.5) risk = 20;
    if (data.familyObesity === "yes") risk += 15;
    if (data.exerciseFrequency === "never") risk += 10;
    return Math.min(risk, 100);
  };

  const calculateHypertensionRisk = (data: any, bmi: number): number => {
    let risk = 0;
    if (bmi > 30) risk += 25;
    if (data.familyHypertension === "yes") risk += 30;
    if (data.smokingStatus === "current") risk += 20;
    if (data.alcoholConsumption === "heavy") risk += 15;
    if (data.exerciseFrequency === "never") risk += 10;
    return Math.min(risk, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="container max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Health Assessment</h1>
              <p className="text-muted-foreground">Step {step} of 4</p>
            </div>
          </div>
        </div>

        <Card className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="30"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4">Family History</h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Family history of diabetes?</Label>
                  <RadioGroup value={formData.familyDiabetes} onValueChange={(value) => setFormData({ ...formData, familyDiabetes: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="diabetes-yes" />
                      <Label htmlFor="diabetes-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="diabetes-no" />
                      <Label htmlFor="diabetes-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label>Family history of hypertension?</Label>
                  <RadioGroup value={formData.familyHypertension} onValueChange={(value) => setFormData({ ...formData, familyHypertension: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="hypertension-yes" />
                      <Label htmlFor="hypertension-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="hypertension-no" />
                      <Label htmlFor="hypertension-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <Label>Family history of obesity?</Label>
                  <RadioGroup value={formData.familyObesity} onValueChange={(value) => setFormData({ ...formData, familyObesity: value })}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="obesity-yes" />
                      <Label htmlFor="obesity-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="obesity-no" />
                      <Label htmlFor="obesity-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4">Medical Information</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Past Major Illnesses</Label>
                  <p className="text-sm text-muted-foreground">Select from options or type your own</p>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => {
                        if (!formData.pastIllnesses.includes(value)) {
                          setFormData({ 
                            ...formData, 
                            pastIllnesses: [...formData.pastIllnesses, value] 
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select illness" />
                      </SelectTrigger>
                      <SelectContent>
                        {illnessOptions.map((illness) => (
                          <SelectItem key={illness} value={illness}>
                            {illness}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or type custom illness"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!formData.pastIllnesses.includes(value)) {
                            setFormData({ 
                              ...formData, 
                              pastIllnesses: [...formData.pastIllnesses, value] 
                            });
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.pastIllnesses.map((illness, idx) => (
                      <Badge key={idx} variant="secondary">
                        {illness}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              pastIllnesses: formData.pastIllnesses.filter((_, i) => i !== idx),
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Current Health Symptoms</Label>
                  <p className="text-sm text-muted-foreground">Select from options or type your own</p>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => {
                        if (!formData.currentSymptoms.includes(value)) {
                          setFormData({ 
                            ...formData, 
                            currentSymptoms: [...formData.currentSymptoms, value] 
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select symptom" />
                      </SelectTrigger>
                      <SelectContent>
                        {symptomOptions.map((symptom) => (
                          <SelectItem key={symptom} value={symptom}>
                            {symptom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or type custom symptom"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!formData.currentSymptoms.includes(value)) {
                            setFormData({ 
                              ...formData, 
                              currentSymptoms: [...formData.currentSymptoms, value] 
                            });
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.currentSymptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary">
                        {symptom}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              currentSymptoms: formData.currentSymptoms.filter((_, i) => i !== idx),
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <p className="text-sm text-muted-foreground">Select your city or type your own</p>
                  <div className="flex gap-2">
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or type custom location"
                      value={!locationOptions.includes(formData.location) ? formData.location : ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <p className="text-sm text-muted-foreground">Select from options or type your own</p>
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => {
                        if (!formData.allergies.includes(value)) {
                          setFormData({ 
                            ...formData, 
                            allergies: [...formData.allergies, value] 
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select allergy" />
                      </SelectTrigger>
                      <SelectContent>
                        {allergyOptions.map((allergy) => (
                          <SelectItem key={allergy} value={allergy}>
                            {allergy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or type custom allergy"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const value = e.currentTarget.value.trim();
                          if (!formData.allergies.includes(value)) {
                            setFormData({ 
                              ...formData, 
                              allergies: [...formData.allergies, value] 
                            });
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="secondary">
                        {allergy}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              allergies: formData.allergies.filter((_, i) => i !== idx),
                            });
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-semibold mb-4">Lifestyle Habits</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Smoking Status</Label>
                  <Select value={formData.smokingStatus} onValueChange={(value) => setFormData({ ...formData, smokingStatus: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="former">Former</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Alcohol Consumption</Label>
                  <Select value={formData.alcoholConsumption} onValueChange={(value) => setFormData({ ...formData, alcoholConsumption: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Exercise Frequency</Label>
                  <Select value={formData.exerciseFrequency} onValueChange={(value) => setFormData({ ...formData, exerciseFrequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="1-2">1-2 times per week</SelectItem>
                      <SelectItem value="3-4">3-4 times per week</SelectItem>
                      <SelectItem value="5+">5+ times per week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Diet Type</Label>
                  <Select value={formData.dietType} onValueChange={(value) => setFormData({ ...formData, dietType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="keto">Keto</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sleep">Average Sleep (hours)</Label>
                  <Input
                    id="sleep"
                    type="number"
                    placeholder="7"
                    value={formData.sleepHours}
                    onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                  {loading ? "Analyzing..." : "Complete Assessment"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Questionnaire;
