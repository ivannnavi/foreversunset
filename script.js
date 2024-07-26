const apiKey = 'a72377dbd15db77164b6d39ce4cc75eb';
        const apiUrlBase = 'https://api.openweathermap.org/data/2.5/weather';

        // Webcam feed data
        const webcamFeeds = [
            {
                location: 'LionsDive Beach Resort | Mambo Beach | Curaçao',
                url: 'https://www.youtube.com/watch?v=loHbMM9JfCs',
                youtubeId: 'loHbMM9JfCs',
                lat: 12.09,
                lon: -68.898,
                sunriseTime: null,
                sunsetTime: null,
                midnightTime: null,
                timezoneOffset: null,
                localTime: null
            },
            {
                location: 'Klein Curacao Beach, Dutch Caribbean',
                url: 'https://www.youtube.com/watch?v=0ImA9IcyQwA',
                youtubeId: '0ImA9IcyQwA',
                lat: 11.9953,
                lon: -68.6488,
                sunriseTime: null,
                sunsetTime: null,
                midnightTime: null,
                timezoneOffset: null,
                localTime: null
            },
            {
                location: 'Deep Cove, North Vancouver',
                url: 'https://www.youtube.com/watch?v=T0oUufecXeE',
                youtubeId: 'T0oUufecXeE',
                lat: 49.3274,
                lon: -122.9495,
                sunriseTime: null,
                sunsetTime: null,
                midnightTime: null,
                timezoneOffset: null,
                localTime: null
            },
            {
                location: 'Tigh-Na-Mara Seaside Spa Resort',
                url: 'https://www.youtube.com/watch?v=NveskAtF9cI',
                youtubeId: 'NveskAtF9cI',
                lat: 49.3344,
                lon: -124.2742,
                sunriseTime: null,
                sunsetTime: null,
                midnightTime: null,
                timezoneOffset: null,
                localTime: null
            },
            {
                location: 'Venice Beach, Los Angeles',
                url: 'https://www.youtube.com/watch?v=3LXQWU67Ufk',
                youtubeId: '3LXQWU67Ufk',
                lat: 33.985,
                lon: -118.4695,
                sunriseTime: null,
                sunsetTime: null,
                midnightTime: null,
                timezoneOffset: null,
                localTime: null
            },
            {
                location: 'The Hale Pau Hana Surf Cam',
                url: 'https://www.youtube.com/watch?v=hPvl6IACa2k',
                youtubeId: 'hPvl6IACa2k',
                lat: 12.09138,
                lon: -68.90098,
                sunriseTime: null,
                sunsetTime: null,
                midnightTime: null,
                timezoneOffset: null,
                localTime: null
            }
        ];

        let player;
        let playerReady = false;
        let currentFeedIndex = 0;

        function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                videoId: webcamFeeds[0].youtubeId,
                playerVars: {
                    'autoplay': 1,
                    'mute': 1,
                    'controls': 0,
                    'loop': 1,
                    'playlist': webcamFeeds[0].youtubeId
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }

        function onPlayerReady(event) {
            playerReady = true;
            event.target.playVideo();
            displayLocationInfo();
            setupStreamSwitching();
        }

        function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.ENDED) {
                event.target.playVideo();
            }
        }

        function ensurePlayerReady(callback) {
            if (player && player.getPlayerState() !== -1) {
                callback();
            } else {
                setTimeout(() => {
                    ensurePlayerReady(callback);
                }, 100);
            }
        }

        function setupStreamSwitching() {
            const timeSelect = document.getElementById('timeSelect');
            timeSelect.addEventListener('change', async function () {
                if (!playerReady) {
                    console.error('Player is not ready yet');
                    return;
                }

                const selectedTime = timeSelect.value;
                console.log('Selected time:', selectedTime);

                let timeType;
                if (selectedTime === 'sunrise') {
                    timeType = 'sunriseTime';
                } else if (selectedTime === 'sunset') {
                    timeType = 'sunsetTime';
                } else if (selectedTime === 'midnight') {
                    timeType = 'midnightTime';
                }

                const closestFeed = findClosestFeedIndex(timeType);
                console.log('Switching to feed:', closestFeed);

                try {
                    if (player && typeof player.cueVideoById === 'function') {
                        player.cueVideoById(closestFeed.youtubeId);
                        player.playVideo();
                        currentFeedIndex = webcamFeeds.indexOf(closestFeed);
                        displayLocationInfo();
                    } else {
                        console.error('player.cueVideoById is not a function');
                    }
                } catch (error) {
                    console.error('Error loading video:', error);
                }
            });
        }

        function findClosestFeedIndex(timeType) {
            const sortedFeeds = [...webcamFeeds].sort((feed1, feed2) => {
                const time1 = feed1[timeType];
                const time2 = feed2[timeType];
                if (!time1 && !time2) return 0;
                if (!time1) return 1;
                if (!time2) return -1;
                const diff1 = Math.abs(feed1.localTime - time1.getTime());
                const diff2 = Math.abs(feed2.localTime - time2.getTime());
                return diff1 - diff2;
            });
            return sortedFeeds[0];
        }

        function displayLocationInfo() {
            const locationInfo = document.getElementById('location');
            locationInfo.textContent = webcamFeeds[currentFeedIndex].location;
        }

        async function fetchTimeTypeTime(latitude, longitude) {
            const apiUrl = `${apiUrlBase}?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch time type time');
                }
                const data = await response.json();
                const timezoneOffset = data.timezone * 1000;
                const adjustedTimezoneOffset = timezoneOffset - 7200000;
                const sunriseTimeUTC = new Date(data.sys.sunrise * 1000);
                const sunsetTimeUTC = new Date(data.sys.sunset * 1000);
                const localSunriseTime = new Date(sunriseTimeUTC.getTime() + adjustedTimezoneOffset);
                const localSunsetTime = new Date(sunsetTimeUTC.getTime() + adjustedTimezoneOffset);
                const currentTimeUTC = new Date();
                const localTime = new Date(currentTimeUTC.getTime() + adjustedTimezoneOffset);
                const midnightTime = new Date(localTime);
                midnightTime.setHours(0, 0, 0, 0);
                return {
                    localSunriseTime,
                    localSunsetTime,
                    midnightTime,
                    adjustedTimezoneOffset,
                    localTime
                };
            } catch (error) {
                console.error('Error fetching time type time:', error);
                throw error;
            }
        }

        async function fetchAndUpdateWebcamFeeds() {
            for (const feed of webcamFeeds) {
                try {
                    const {
                        localSunriseTime,
                        localSunsetTime,
                        midnightTime,
                        adjustedTimezoneOffset,
                        localTime
                    } = await fetchTimeTypeTime(feed.lat, feed.lon);

                    feed.sunriseTime = localSunriseTime;
                    feed.sunsetTime = localSunsetTime;
                    feed.midnightTime = midnightTime;
                    feed.timezoneOffset = adjustedTimezoneOffset;
                    feed.localTime = localTime;
                } catch (error) {
                    console.error(`Error updating feed ${feed.location}:`, error);
                }
            }
            console.log('Updated webcam feeds with times:', webcamFeeds);
            const closestToSunrise = findClosestFeedIndex('sunriseTime');
            const closestToSunset = findClosestFeedIndex('sunsetTime');
            const closestToMidnight = findClosestFeedIndex('midnightTime');
            console.log('---------------------Closest to Sunrise:');
            console.log(closestToSunrise.location);
            console.log('---------------------Closest to Sunset:');
            console.log(closestToSunset.location);
            console.log('---------------------Closest to Midnight:');
            console.log(closestToMidnight.location);
        }

        document.addEventListener('DOMContentLoaded', () => {
            fetchAndUpdateWebcamFeeds();
            ensurePlayerReady(() => {
                setupStreamSwitching();
            });
        });