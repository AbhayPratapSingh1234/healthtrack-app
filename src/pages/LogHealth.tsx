import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Activity, ArrowLeft, Calendar, Heart, Droplets, Moon, Zap, Smile, Footprints, Scale, Activity as ActivityIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const LogHealth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    log_date: today,
    weight: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    blood_glucose: "",
    exercise_minutes: "",
    heart_rate: "",
    cholesterol_total: "",
    cholesterol_hdl: "",
    cholesterol_ldl: "",
    sleep_hours: "",
    water_intake: "",
    body_fat_percentage: "",
    mood_rating: "",
    daily_steps: "",
    meals_description: "",
    notes: "",
  });

  useEffect(() => {
    checkAuth();
    loadTodayLog();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadTodayLog = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("daily_health_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", today)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFormData({
          log_date: data.log_date,
          weight: data.weight?.toString() || "",
          blood_pressure_systolic: data.blood_pressure_systolic?.toString() || "",
          blood_pressure_diastolic: data.blood_pressure_diastolic?.toString() || "",
          blood_glucose: data.blood_glucose?.toString() || "",
          exercise_minutes: data.exercise_minutes?.toString() || "",
          heart_rate: data.heart_rate?.toString() || "",
          cholesterol_total: data.cholesterol_total?.toString() || "",
          cholesterol_hdl: data.cholesterol_hdl?.toString() || "",
          cholesterol_ldl: data.cholesterol_ldl?.toString() || "",
          sleep_hours: data.sleep_hours?.toString() || "",
          water_intake: data.water_intake?.toString() || "",
          body_fat_percentage: data.body_fat_percentage?.toString() || "",
          mood_rating: data.mood_rating?.toString() || "",
          daily_steps: data.daily_steps?.toString() || "",
          meals_description: data.meals_description || "",
          notes: data.notes || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading log:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const logData: any = {
        user_id: user.id,
        log_date: formData.log_date,
      };

      if (formData.weight) logData.weight = parseFloat(formData.weight);
      if (formData.blood_pressure_systolic) logData.blood_pressure_systolic = parseInt(formData.blood_pressure_systolic);
      if (formData.blood_pressure_diastolic) logData.blood_pressure_diastolic = parseInt(formData.blood_pressure_diastolic);
      if (formData.blood_glucose) logData.blood_glucose = parseFloat(formData.blood_glucose);
      if (formData.exercise_minutes) logData.exercise_minutes = parseInt(formData.exercise_minutes);
      if (formData.heart_rate) logData.heart_rate = parseInt(formData.heart_rate);
      if (formData.cholesterol_total) logData.cholesterol_total = parseFloat(formData.cholesterol_total);
      if (formData.cholesterol_hdl) logData.cholesterol_hdl = parseFloat(formData.cholesterol_hdl);
      if (formData.cholesterol_ldl) logData.cholesterol_ldl = parseFloat(formData.cholesterol_ldl);
      if (formData.sleep_hours) logData.sleep_hours = parseFloat(formData.sleep_hours);
      if (formData.water_intake) logData.water_intake = parseFloat(formData.water_intake);
      if (formData.body_fat_percentage) logData.body_fat_percentage = parseFloat(formData.body_fat_percentage);
      if (formData.mood_rating) logData.mood_rating = parseInt(formData.mood_rating);
      if (formData.daily_steps) logData.daily_steps = parseInt(formData.daily_steps);
      if (formData.meals_description) logData.meals_description = formData.meals_description;
      if (formData.notes) logData.notes = formData.notes;

      const { error } = await supabase
        .from("daily_health_logs")
        .upsert(logData, { onConflict: "user_id,log_date" });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Health log saved successfully.",
      });
      navigate("/dashboard");
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
              <h1 className="text-3xl font-bold">Daily Health Log</h1>
              <p className="text-muted-foreground">Track your daily health metrics</p>
            </div>
          </div>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  className="pl-10"
                  value={formData.log_date}
                  onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                  max={today}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="glucose">Blood Glucose (mg/dL)</Label>
                <Input
                  id="glucose"
                  type="number"
                  step="0.1"
                  placeholder="100"
                  value={formData.blood_glucose}
                  onChange={(e) => setFormData({ ...formData, blood_glucose: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bp-systolic">Blood Pressure (Systolic)</Label>
                <Input
                  id="bp-systolic"
                  type="number"
                  placeholder="120"
                  value={formData.blood_pressure_systolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bp-diastolic">Blood Pressure (Diastolic)</Label>
                <Input
                  id="bp-diastolic"
                  type="number"
                  placeholder="80"
                  value={formData.blood_pressure_diastolic}
                  onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise (minutes)</Label>
              <Input
                id="exercise"
                type="number"
                placeholder="30"
                value={formData.exercise_minutes}
                onChange={(e) => setFormData({ ...formData, exercise_minutes: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                  <Input
                    id="heart-rate"
                    type="number"
                    className="pl-10"
                    placeholder="70"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sleep-hours">Sleep Hours</Label>
                <div className="relative">
                  <Moon className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                  <Input
                    id="sleep-hours"
                    type="number"
                    step="0.1"
                    className="pl-10"
                    placeholder="8.0"
                    value={formData.sleep_hours}
                    onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="water-intake">Water Intake (liters)</Label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                  <Input
                    id="water-intake"
                    type="number"
                    step="0.1"
                    className="pl-10"
                    placeholder="2.0"
                    value={formData.water_intake}
                    onChange={(e) => setFormData({ ...formData, water_intake: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body-fat">Body Fat Percentage (%)</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                  <Input
                    id="body-fat"
                    type="number"
                    step="0.1"
                    className="pl-10"
                    placeholder="15.0"
                    value={formData.body_fat_percentage}
                    onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mood-rating">Mood Rating (1-10)</Label>
                <div className="relative">
                  <Smile className="absolute left-3 top-3 h-4 w-4 text-yellow-500" />
                  <Input
                    id="mood-rating"
                    type="number"
                    min="1"
                    max="10"
                    className="pl-10"
                    placeholder="7"
                    value={formData.mood_rating}
                    onChange={(e) => setFormData({ ...formData, mood_rating: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-steps">Daily Steps</Label>
                <div className="relative">
                  <Footprints className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                  <Input
                    id="daily-steps"
                    type="number"
                    className="pl-10"
                    placeholder="10000"
                    value={formData.daily_steps}
                    onChange={(e) => setFormData({ ...formData, daily_steps: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Cholesterol */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                Cholesterol
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cholesterol-total">Total Cholesterol</Label>
                  <Input
                    id="cholesterol-total"
                    type="number"
                    step="0.1"
                    placeholder="200"
                    value={formData.cholesterol_total}
                    onChange={(e) => setFormData({ ...formData, cholesterol_total: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cholesterol-hdl">HDL Cholesterol</Label>
                  <Input
                    id="cholesterol-hdl"
                    type="number"
                    step="0.1"
                    placeholder="50"
                    value={formData.cholesterol_hdl}
                    onChange={(e) => setFormData({ ...formData, cholesterol_hdl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cholesterol-ldl">LDL Cholesterol</Label>
                  <Input
                    id="cholesterol-ldl"
                    type="number"
                    step="0.1"
                    placeholder="130"
                    value={formData.cholesterol_ldl}
                    onChange={(e) => setFormData({ ...formData, cholesterol_ldl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Meals & Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-orange-500" />
                Meals & Notes
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meals">Meals & Diet</Label>
                  <Textarea
                    id="meals"
                    placeholder="Breakfast: Oatmeal with berries&#10;Lunch: Grilled chicken salad&#10;Dinner: Salmon with vegetables"
                    value={formData.meals_description}
                    onChange={(e) => setFormData({ ...formData, meals_description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about your health today..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Health Log"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LogHealth;
