import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axiosClient from "../services/axios";
import { setUser } from "../store/slices/authSlice";

// Keeps the logged-in user's verification status fresh without a manual reload.
// Identity (CIN) and vehicle/documents are two independent tracks; this polls
// /api/user and pushes either change into Redux so the profile alerts and
// badges flip live, with a matching toast.
export default function useVerificationSync(intervalMs = 15000) {
  const dispatch = useDispatch();
  const { isAuth, user } = useSelector((state) => state.auth);

  // Track the last seen statuses across polls without re-arming the interval.
  const lastIdentity = useRef(user?.statut_verification);
  const lastVehicle = useRef(user?.vehicle_verification);
  useEffect(() => {
    lastIdentity.current = user?.statut_verification;
    lastVehicle.current = user?.vehicle_verification;
  }, [user?.statut_verification, user?.vehicle_verification]);

  useEffect(() => {
    if (!isAuth) return;
    let active = true;

    const announce = (track, status) => {
      if (status === "verified") {
        toast.success(track === "identity" ? "Votre identité a été vérifiée" : "Votre véhicule a été validé");
      } else if (status === "rejected") {
        toast.error(
          track === "identity"
            ? "Votre pièce d'identité a été refusée. Veuillez la renvoyer."
            : "Vos documents véhicule ont été refusés. Veuillez les renvoyer."
        );
      }
    };

    const sync = async () => {
      try {
        const { data } = await axiosClient.get("/api/user");
        if (!active || !data) return;

        const identityChanged = data.statut_verification !== lastIdentity.current;
        const vehicleChanged = data.vehicle_verification !== lastVehicle.current;
        if (!identityChanged && !vehicleChanged) return;

        const prevIdentity = lastIdentity.current;
        const prevVehicle = lastVehicle.current;
        lastIdentity.current = data.statut_verification;
        lastVehicle.current = data.vehicle_verification;
        dispatch(setUser(data));

        if (identityChanged && prevIdentity !== undefined) announce("identity", data.statut_verification);
        if (vehicleChanged && prevVehicle !== undefined) announce("vehicle", data.vehicle_verification);
      } catch {
        /* silent — keep the current state on transient errors */
      }
    };

    const id = setInterval(sync, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [isAuth, intervalMs, dispatch]);
}
