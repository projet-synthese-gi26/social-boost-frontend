"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadService, usersService } from '@lib/api/services';
import { useUser } from '@lib/hooks/useAPI';

export default function PostInscriptionPage() {
  const router = useRouter();
  const { user, isLoading: isLoadingUser, refresh } = useUser();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] = useState<string | null>(null);
  const [coverPhotoPreviewUrl, setCoverPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const needs = localStorage.getItem('needs_onboarding');
    if (!needs) {
      router.replace('/post_connexion/Accueils');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    setUsername(user.username || '');
    setFirstName(user.first_name || '');
    setLastName(user.last_name || '');
    setCity(user.city || '');
    setGender(user.gender || '');
    setBirthDate(user.birth_date || '');
    setInterestsText((user.interests || []).join(', '));
    setProfilePictureUrl(user.profile_picture_url || '');
    setCoverPhotoUrl(user.cover_photo_url || '');
  }, [user]);

  useEffect(() => {
    return () => {
      if (profilePicturePreviewUrl) URL.revokeObjectURL(profilePicturePreviewUrl);
      if (coverPhotoPreviewUrl) URL.revokeObjectURL(coverPhotoPreviewUrl);
    };
  }, [profilePicturePreviewUrl, coverPhotoPreviewUrl]);

  const handlePickProfilePicture = async (file: File | null) => {
    if (!file) return;

    setError(null);
    if (profilePicturePreviewUrl) URL.revokeObjectURL(profilePicturePreviewUrl);
    setProfilePicturePreviewUrl(URL.createObjectURL(file));

    setIsUploadingProfile(true);
    try {
      const uploaded = await uploadService.file(file, 'IMAGE');
      if (uploaded?.url) setProfilePictureUrl(uploaded.url);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        "Impossible d'uploader la photo de profil.";
      setError(msg);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handlePickCoverPhoto = async (file: File | null) => {
    if (!file) return;

    setError(null);
    if (coverPhotoPreviewUrl) URL.revokeObjectURL(coverPhotoPreviewUrl);
    setCoverPhotoPreviewUrl(URL.createObjectURL(file));

    setIsUploadingCover(true);
    try {
      const uploaded = await uploadService.file(file, 'IMAGE');
      if (uploaded?.url) setCoverPhotoUrl(uploaded.url);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        "Impossible d'uploader la photo de couverture.";
      setError(msg);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const interests = useMemo(() => {
    return interestsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [interestsText]);

  const goNext = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('needs_onboarding');
    }
    router.push('/post_connexion/Accueils');
  };

  const buildPayload = () => {
    const payload: any = {};

    if (username.trim()) payload.username = username.trim();
    if (firstName.trim()) payload.first_name = firstName.trim();
    if (lastName.trim()) payload.last_name = lastName.trim();
    if (city.trim()) payload.city = city.trim();
    if (gender.trim()) payload.gender = gender.trim();
    if (birthDate) payload.birth_date = birthDate;
    if (interests.length > 0) payload.interests = interests;
    if (profilePictureUrl.trim()) payload.profile_picture_url = profilePictureUrl.trim();
    if (coverPhotoUrl.trim()) payload.cover_photo_url = coverPhotoUrl.trim();

    return payload;
  };

  const handleSubmitAndNext = async () => {
    setError(null);

    if (isUploadingProfile || isUploadingCover) {
      setError("Veuillez patienter pendant l'upload des images.");
      return;
    }

    const payload = buildPayload();
    const hasAny = Object.keys(payload).length > 0;

    if (!hasAny) {
      goNext();
      return;
    }

    setIsSaving(true);
    try {
      await usersService.updateProfile(payload);
      await refresh();
      goNext();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        'Impossible de sauvegarder vos informations.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="text-gray-700">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Compléter votre profil</h1>
          <p className="text-gray-500 mt-1">
            Ces informations sont facultatives. Tu peux les remplir maintenant ou passer.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {error ? <div className="text-red-600 text-sm">{error}</div> : null}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              placeholder="ex: jean.dupont"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              placeholder="Douala"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <input
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                placeholder="ex: Homme"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Centres d'intérêt</label>
            <input
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              placeholder="ex: Musique, Sport, Tech"
            />
            <div className="text-xs text-gray-500 mt-1">Sépare avec des virgules.</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                {profilePicturePreviewUrl || profilePictureUrl ? (
                  <img
                    src={profilePicturePreviewUrl || profilePictureUrl}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePickProfilePicture(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {isUploadingProfile ? 'Upload en cours…' : profilePictureUrl ? 'Upload terminé.' : 'Choisis une image depuis ton appareil.'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo de couverture</label>
            <div className="space-y-2">
              <div className="w-full h-32 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                {coverPhotoPreviewUrl || coverPhotoUrl ? (
                  <img
                    src={coverPhotoPreviewUrl || coverPhotoUrl}
                    alt="Photo de couverture"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePickCoverPhoto(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              <div className="text-xs text-gray-500">
                {isUploadingCover ? 'Upload en cours…' : coverPhotoUrl ? 'Upload terminé.' : 'Choisis une image depuis ton appareil.'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={goNext}
            disabled={isSaving || isUploadingProfile || isUploadingCover}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-semibold disabled:opacity-70"
          >
            Passer
          </button>
          <button
            onClick={handleSubmitAndNext}
            disabled={isSaving || isUploadingProfile || isUploadingCover}
            className="px-5 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition font-semibold disabled:opacity-70"
          >
            {isSaving ? 'Enregistrement...' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}
