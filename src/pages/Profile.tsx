import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Save, Edit, UserCheck, Phone, MapPin, Heart, FileText, CheckCircle } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('edit');
  const [progress, setProgress] = useState(0);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      age: "",
      phone: "",
      address: "",
      bloodGroup: "",
    }
  });

  const watchedFields = watch();

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    setMode(modeParam === 'view' ? 'view' : modeParam === 'create' ? 'create' : 'edit');
    checkAuth();
  }, [searchParams]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // For create mode, start with empty form
    if (mode === 'create') {
      setValue('email', session.user.email || "");
    } else {
      // For view/edit mode, load existing data
      setValue('name', session.user.user_metadata?.name || "");
      setValue('email', session.user.email || "");
      setValue('bio', session.user.user_metadata?.bio || "");
      setValue('age', session.user.user_metadata?.age || "");
      setValue('phone', session.user.user_metadata?.phone || "");
      setValue('address', session.user.user_metadata?.address || "");
      setValue('bloodGroup', session.user.user_metadata?.bloodGroup || "");
    }
    setLoading(false);
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          bio: data.bio,
          age: data.age,
          phone: data.phone,
          address: data.address,
          bloodGroup: data.bloodGroup,
        }
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      if (mode === 'create') {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculate progress for create mode
  useEffect(() => {
    if (mode === 'create') {
      const fields = ['name', 'age', 'phone', 'address', 'bloodGroup', 'bio'];
      const filledFields = fields.filter(field => watchedFields[field as keyof typeof watchedFields]?.trim());
      setProgress((filledFields.length / fields.length) * 100);
    }
  }, [watchedFields, mode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-8 w-8 animate-pulse mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Profile</span>
          </div>
          {mode === 'create' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Progress:</span>
              <Progress value={progress} className="w-20" />
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section for Create Mode */}
          {mode === 'create' && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HealthTrack!</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Let's get to know you better. Fill in your details below to personalize your health tracking experience.
              </p>
            </div>
          )}

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl flex items-center gap-2 text-gray-900">
                <User className="h-6 w-6 text-blue-600" />
                {mode === 'view' ? 'My Profile' : 'Create Your Profile'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {mode === 'view'
                  ? 'View and manage your personal information'
                  : 'Fill in your details to personalize your health tracking experience'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    {mode === 'view' ? (
                      <p className="text-sm font-medium p-2 bg-gray-50 rounded-md">
                        {watchedFields.name || "Not provided"}
                      </p>
                    ) : (
                      <Input
                        id="name"
                        {...register("name", { required: "Full name is required" })}
                        placeholder="Enter your full name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                    )}
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded-md">
                      {watchedFields.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Email cannot be changed here. Contact support if needed.
                    </p>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age *</Label>
                      {mode === 'view' ? (
                        <p className="text-sm font-medium p-2 bg-gray-50 rounded-md">
                          {watchedFields.age || "Not provided"}
                        </p>
                      ) : (
                        <Input
                          id="age"
                          type="number"
                          {...register("age", {
                            required: "Age is required",
                            min: { value: 1, message: "Age must be at least 1" },
                            max: { value: 120, message: "Age must be less than 120" }
                          })}
                          placeholder="Enter your age"
                          className={errors.age ? "border-red-500" : ""}
                        />
                      )}
                      {errors.age && <p className="text-sm text-red-500">{errors.age.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {mode === 'view' ? (
                        <p className="text-sm font-medium p-2 bg-gray-50 rounded-md">
                          {watchedFields.phone || "Not provided"}
                        </p>
                      ) : (
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          placeholder="Enter your phone number"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {mode === 'view' ? (
                      <p className="text-sm font-medium p-2 bg-gray-50 rounded-md whitespace-pre-wrap">
                        {watchedFields.address || "Not provided"}
                      </p>
                    ) : (
                      <Textarea
                        id="address"
                        {...register("address")}
                        placeholder="Enter your address"
                        rows={3}
                      />
                    )}
                  </div>
                </div>

                {/* Health Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Heart className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Health Information</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    {mode === 'view' ? (
                      <p className="text-sm font-medium p-2 bg-gray-50 rounded-md">
                        {watchedFields.bloodGroup || "Not provided"}
                      </p>
                    ) : (
                      <Input
                        id="bloodGroup"
                        {...register("bloodGroup")}
                        placeholder="e.g., A+, B-, O+, AB+"
                      />
                    )}
                  </div>
                </div>

                {/* Bio Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">About You</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    {mode === 'view' ? (
                      <p className="text-sm font-medium p-2 bg-gray-50 rounded-md whitespace-pre-wrap">
                        {watchedFields.bio || "Not provided"}
                      </p>
                    ) : (
                      <Textarea
                        id="bio"
                        {...register("bio")}
                        placeholder="Tell us a bit about yourself and your health goals..."
                        rows={4}
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {mode === 'view' ? (
                    <Button
                      onClick={() => navigate("/profile?mode=edit")}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => navigate("/")}
                  >
                    {mode === 'view' ? 'Back to Home' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
