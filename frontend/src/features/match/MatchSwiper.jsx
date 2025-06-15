import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import {getCsrfToken} from "../../api/authService";
import SympathyModal from "./modals/SympathyModal";
import PhotoPreviewGrid from "../shared/components/PhotoPreviewGrid";
import "./MatchSwiper.css";
import {useTranslation} from "react-i18next";
import {useContext} from "react";
import AuthContext from "../../app/context/AuthContext";
import Header from "../shared/components/Header";
import MatchFilterModal from "./modals/MatchFilterModal";

const MatchSwiper = () => {
    const {t} = useTranslation();
    const {pet_id} = useParams();
    const [matches, setMatches] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [error, setError] = useState(null);
    const [matchMessage, setMatchMessage] = useState("");
    const [showSympathyModal, setShowSympathyModal] = useState(false);
    const [sympathyPetData, setSympathyPetData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const {user} = useContext(AuthContext);
    const [isPremium, setIsPremium] = useState(true);
    const [viewCount, setViewCount] = useState(0);
    const [limitReached, setLimitReached] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [minAge, setMinAge] = useState("");
    const [maxAge, setMaxAge] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [breedFilter, setBreedFilter] = useState("");
    const [colorFilter, setColorFilter] = useState("");
    const [allMatches, setAllMatches] = useState([]);


    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/matching/match/${pet_id}/`);
                setAllMatches(response.data.matches);
                setMatches(response.data.matches);
            } catch (err) {
                console.error("Match fetch error:", err);
                setError(t("errors.pets.load"));
            }
        };
        fetchMatches();
    }, [pet_id, t]);
    useEffect(() => {
        resetViewLimitIfExpired(); // 👈 ДО запроса пользователя

        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://localhost:8000/users/my_info/", {
                    withCredentials: true
                });

                const info = response.data.chats?.[0];
                setIsPremium(info?.is_premium);

                const count = Number(localStorage.getItem("nonPremiumViewCount") || "0");
                setViewCount(count);
            } catch (e) {
                console.error("Ошибка загрузки профиля пользователя", e);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        setMatchMessage("");
    }, [currentIndex]);

    const resetViewLimitIfExpired = () => {
        const lastViewTime = localStorage.getItem("nonPremiumViewTimestamp");
        const now = Date.now();


        if (!lastViewTime || now - Number(lastViewTime) > 21600000) {
            localStorage.setItem("nonPremiumViewCount", "0");
            localStorage.setItem("nonPremiumViewTimestamp", now.toString());
            setViewCount(0);
        }
    };

    const incrementNonPremiumView = () => {
        const newCount = viewCount + 1;
        localStorage.setItem("nonPremiumViewCount", newCount.toString());
        localStorage.setItem("nonPremiumViewTimestamp", Date.now().toString());
        setViewCount(newCount);
    };

    const handleLike = async () => {
        const match = matches[currentIndex];
        try {
            const csrf = await getCsrfToken();

            await axios.post(
                `http://localhost:8000/matching/like/${pet_id}/${match.id}/`,
                {},
                {headers: {"X-CSRFToken": csrf}, withCredentials: true}
            );

            const res = await axios.post(
                `http://localhost:8000/matching/sympathy/${pet_id}/`,
                {},
                {headers: {"X-CSRFToken": csrf}, withCredentials: true}
            );

            if (res.data.success) {
                const {pet1, pet2} = res.data;

                const isMutual = (pet1 === Number(pet_id) && pet2 === match.id) ||
                    (pet2 === Number(pet_id) && pet1 === match.id);

                if (isMutual) {
                    const petInfoRes = await axios.get(`http://localhost:8000/pets/get_pet/${match.id}/`, {
                        withCredentials: true
                    });
                    setSympathyPetData(petInfoRes.data.report);
                    setShowSympathyModal(true);
                } else {
                    if (!isPremium) incrementNonPremiumView();
                    setCurrentIndex(prev => prev + 1);
                    console.log(setCurrentIndex)
                }
            } else {
                if (!isPremium) incrementNonPremiumView();
                setCurrentIndex(prev => prev + 1);
                console.log(setCurrentIndex)
            }

        } catch (e) {
            console.error("Like error:", e);
            if (!isPremium) incrementNonPremiumView();
            setCurrentIndex(prev => prev + 1);
            console.log(setCurrentIndex)
        }
    };
    const formatAge = (months) => {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years > 0 && remainingMonths > 0) {
            return `${years} ${t("match.years")} ${remainingMonths} ${t("match.months")}`;
        } else if (years > 0) {
            return `${years} ${t("match.years")}`;
        } else {
            return `${remainingMonths} ${t("match.months")}`;
        }
    };

    const BreedOptions = {
        Dog: [
            { value: "Labrador", label: t("breed.dog.labrador") },
            { value: "Beagle", label: t("breed.dog.beagle") },
            { value: "Poodle", label: t("breed.dog.poodle") },
            { value: "Bulldog", label: t("breed.dog.bulldog") },
            { value: "Terrier", label: t("breed.dog.terrier") },
            { value: "Shiba", label: t("breed.dog.shiba") },
            { value: "Husky", label: t("breed.dog.husky") },
            { value: "Dachshund", label: t("breed.dog.dachshund") },
        ],
        Cat: [
            { value: "Persian", label: t("breed.cat.persian") },
            { value: "Siamese", label: t("breed.cat.siamese") },
            { value: "Mainecoon", label: t("breed.cat.mainecoon") },
            { value: "Sphynx", label: t("breed.cat.sphynx") },
            { value: "British", label: t("breed.cat.british") },
            { value: "Bengal", label: t("breed.cat.bengal") },
            { value: "Scottish", label: t("breed.cat.scottish") },
            { value: "Oriental", label: t("breed.cat.oriental") },
        ],
        Rabbit: [
            { value: "Lop", label: t("breed.rabbit.lop") },
            { value: "Dwarf", label: t("breed.rabbit.dwarf") },
            { value: "Rex", label: t("breed.rabbit.rex") },
            { value: "Angora", label: t("breed.rabbit.angora") },
            { value: "Flemish", label: t("breed.rabbit.flemish") },
            { value: "Lionhead", label: t("breed.rabbit.lionhead") },
            { value: "Silver", label: t("breed.rabbit.silver") },
            { value: "Californian", label: t("breed.rabbit.californian") },
        ],
        Parrot: [
            { value: "Budgie", label: t("breed.parrot.budgie") },
            { value: "Cockatiel", label: t("breed.parrot.cockatiel") },
            { value: "Canary", label: t("breed.parrot.canary") },
            { value: "Lovebird", label: t("breed.parrot.lovebird") },
            { value: "Finch", label: t("breed.parrot.finch") },
            { value: "Parrot", label: t("breed.parrot.parrot") },
            { value: "Macaw", label: t("breed.parrot.macaw") },
            { value: "Cockatoo", label: t("breed.parrot.cockatoo") },
        ]
    };

    const CoatColorOptions = {
        Dog: [
            { value: "Black", label: t("coat.dog.black") },
            { value: "White", label: t("coat.dog.white") },
            { value: "Brown", label: t("coat.dog.brown") },
            { value: "Golden", label: t("coat.dog.golden") },
            { value: "Gray", label: t("coat.dog.gray") },
            { value: "Spotted", label: t("coat.dog.spotted") },
            { value: "Brindle", label: t("coat.dog.brindle") },
            { value: "Tan", label: t("coat.dog.tan") },
        ],
        Cat: [
            { value: "Grey", label: t("coat.cat.grey") },
            { value: "Orange", label: t("coat.cat.orange") },
            { value: "White", label: t("coat.cat.white") },
            { value: "Black", label: t("coat.cat.black") },
            { value: "Calico", label: t("coat.cat.calico") },
            { value: "Tabby", label: t("coat.cat.tabby") },
            { value: "Point", label: t("coat.cat.point") },
            { value: "Blue", label: t("coat.cat.blue") },
        ],
        Rabbit: [
            { value: "White", label: t("coat.rabbit.white") },
            { value: "Grey", label: t("coat.rabbit.grey") },
            { value: "Black", label: t("coat.rabbit.black") },
            { value: "Brown", label: t("coat.rabbit.brown") },
            { value: "Blue", label: t("coat.rabbit.blue") },
            { value: "Fawn", label: t("coat.rabbit.fawn") },
            { value: "Chinchilla", label: t("coat.rabbit.chinchilla") },
            { value: "Broken", label: t("coat.rabbit.broken") },
        ],
        Parrot: [
            { value: "Green", label: t("coat.parrot.green") },
            { value: "Yellow", label: t("coat.parrot.yellow") },
            { value: "Blue", label: t("coat.parrot.blue") },
            { value: "White", label: t("coat.parrot.white") },
            { value: "Grey", label: t("coat.parrot.grey") },
            { value: "Red", label: t("coat.parrot.red") },
            { value: "Multicolor", label: t("coat.parrot.multicolor") },
            { value: "Orange", label: t("coat.parrot.orange") },
        ]
    };

    const handleSkip = () => {
        if (!isPremium) incrementNonPremiumView();
        setCurrentIndex(prev => prev + 1);
        console.log(setCurrentIndex)
    };

    const applyFilters = () => {
        let filtered = allMatches.filter(match => {
            const ageValid = (!minAge || match.age >= Number(minAge)) &&
                (!maxAge || match.age <= Number(maxAge));
            const priceValid = (!maxPrice || parseFloat(match.price) <= parseFloat(maxPrice));
            const breedValid = (!breedFilter || match.breed === breedFilter);
            const colorValid = (!colorFilter || match.coat_color === colorFilter);

            return ageValid && priceValid && breedValid && colorValid;
        });

        setMatches(filtered);
        setCurrentIndex(0);
        setShowFilters(false);
    };

    const handleDislike = async () => {
        const match = matches[currentIndex];
        try {
            const csrf = await getCsrfToken();
            await axios.post(
                `http://localhost:8000/matching/match/${pet_id}/dislike/${match.id}/`,
                {},
                {headers: {"X-CSRFToken": csrf}, withCredentials: true}
            );
        } catch (e) {
            console.error("Dislike error:", e);
        } finally {
            setCurrentIndex(prev => prev + 1);
        }
        if (!isPremium) incrementNonPremiumView();
    };

    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (matches.length === 0)
        return (
            <div className="match-card">
                <p className="text-center">{t("match.no_matches")}</p>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                        {t("match.back_to_profile")}
                    </button>
                </div>
            </div>
        );
    if (currentIndex >= matches.length)
        return (
            <div className="match-card">
                <p className="text-center">{t("match.all_seen")}</p>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                        {t("match.back_to_profile")}
                    </button>
                </div>
            </div>
        );
    if (!isPremium && viewCount >= 5) {
        return (
            <div className="match-card">
                <p className="text-center text-red-500 font-semibold mb-4">
                    {t("match.limit_reached") || "Вы достигли лимита просмотров"}
                </p>
                <p className="text-center mb-4">
                    {t("match.premium_offer") || "Купите премиум, чтобы просматривать больше анкет."}
                </p>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = "/profile"}>
                        {t("match.back_to_profile")}
                    </button>
                </div>
            </div>
        );
    }
    const match = matches[currentIndex];

    return (
        <>
            <Header/>
            <div className="match-card">
                <h2>{t(`species.${match.species.toLowerCase()}`)} ({t(`petcard.gender.${match.gender.toLowerCase()}`)})</h2>
                <p><strong>{t("match.breed")}:</strong> {match.breed ? t(`breed.${match.species.toLowerCase()}.${match.breed.toLowerCase()}`) : t("match.unknown")}</p>
                <p><strong>{t("match.color")}:</strong> {match.coat_color ? t(`coat.${match.species.toLowerCase()}.${match.coat_color.toLowerCase()}`) : t("match.unknown")}</p>
                <p><strong>{t("match.age")}:</strong> {formatAge(match.age)}</p>
                <p><strong>{t("match.price")}:</strong> {match.price || t("match.free")}</p>

                {match.photos?.length > 0 && (
                    <div className="match-photo-wrapper" onClick={() => setShowPreview(true)}>
                        <img
                            src={`http://localhost:8000${match.photos[0]}`}
                            alt="pet"
                            className="match-photo"
                        />
                    </div>
                )}

                {matchMessage && <p className="match-info-message">{matchMessage}</p>}
                <button onClick={() => setShowFilters(!showFilters)} className="match-btn-filter">
                    ⚙️ {t("match.filters")}
                </button>


                <div className="match-buttons">
                    <button onClick={handleDislike} className="match-btn match-btn-dislike">
                        {t("match.dislike")}
                    </button>
                    <button onClick={handleSkip} className="match-btn match-btn-skip">
                        {t("match.skip")}
                    </button>
                    <button onClick={handleLike} className="match-btn match-btn-like">
                        {t("match.like")}
                    </button>
                </div>
                <div className="match-back-wrapper">
                    <button className="match-btn match-btn-back" onClick={() => window.location.href = '/profile'}>
                        {t("match.back_to_profile")}
                    </button>
                </div>
                {showPreview && (
                    <PhotoPreviewGrid photos={match.photos} onClose={() => setShowPreview(false)}/>
                )}
                {showSympathyModal && (
                    <SympathyModal
                        pet={sympathyPetData}
                        onNext={() => {
                            setShowSympathyModal(false);
                            setCurrentIndex(prev => prev + 1);
                        }}
                    />
                )}





                {showFilters && (
                    <MatchFilterModal
                        species={match.species}
                        breedOptions={BreedOptions[match.species] || []}
                        coatColorOptions={CoatColorOptions[match.species] || []}
                        filters={{ minAge, maxAge, maxPrice, breed: breedFilter, color: colorFilter }}
                        onChange={(key, value) => {
                            if (key === "breed") setBreedFilter(value);
                            else if (key === "color") setColorFilter(value);
                            else if (key === "minAge") setMinAge(value);
                            else if (key === "maxAge") setMaxAge(value);
                            else if (key === "maxPrice") setMaxPrice(value);
                        }}
                        onApply={applyFilters}
                        onClose={() => setShowFilters(false)}
                    />
                )}
            </div>
        </>
    );
};

export default MatchSwiper;
