// GSAP 플러그인은 공통으로 사용되므로 맨 위에 한 번만 등록합니다.
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// DOM이 완전히 로드된 후 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', function () {

    // =============================================
    // 1. 공통 기능: 부드러운 스크롤 & 스크롤 애니메이션
    // =============================================

    // 부드러운 스크롤 설정
    const links = document.querySelectorAll(".nav-link, .hero-btn");
    links.forEach(link => {
        link.addEventListener("click", e => {
            const href = e.currentTarget.getAttribute("href");
            // 현재 페이지 내부의 섹션 앵커(#) 링크인지 확인
            const isInternalScroll = href && href.startsWith("#") && href.includes(window.location.pathname);
            
            if (isInternalScroll) {
                e.preventDefault();
                gsap.to(window, {
                    duration: 0.8,
                    scrollTo: { y: href },
                    ease: "power3.out"
                });
            }
        });
    });

    // .fade-in 요소 스크롤 애니메이션 (모든 페이지 공통)
    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach(el => {
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
            }
        });
    });
    
    // =============================================
    // 2. Index.html 전용 기능: 히어로 섹션 인터랙션
    // =============================================
    const heroArea = document.querySelector(".hero-interaction-area");

    // 💥 안전장치: heroArea 요소가 있는 (index.html) 페이지에서만 실행
    if (heroArea) { 
        console.log("인덱스 페이지 전용 스크립트 실행"); 
        
        const heroButtons = document.querySelectorAll(".hero-btn");
        const starObject = document.querySelector(".star-object");
        const flickerTimelines = [];

        // 2-1. 버튼 깜빡임 타임라인 설정
        heroButtons.forEach((btn, index) => {
            const tl = gsap.timeline({ 
                repeat: -1, 
                yoyo: true, 
                defaults: { ease: "sine.inOut" } 
            });
            const startDelay = gsap.utils.random(0, 1);
            const flickerDuration = gsap.utils.random(1, 2);

            tl.to(btn, { opacity: 0.6, duration: flickerDuration, delay: startDelay })
              .to(btn, { opacity: 0.1, duration: flickerDuration });
            
            tl.play(0); 
            flickerTimelines.push(tl);
        });

        // 2-2. 마우스 오버 시 버튼 나타나는 타임라인
        const showButtonsTimeline = gsap.timeline({ paused: true });
        showButtonsTimeline.to(heroButtons, {
            opacity: 1,
            scale: 1,
            pointerEvents: 'auto',
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });

        // 2-3. 마우스 이벤트 핸들러
        heroArea.addEventListener("mouseenter", () => {
            flickerTimelines.forEach(tl => tl.pause(0).kill()); // 깜빡임 중단 및 제거
            gsap.set(heroButtons, { opacity: 0.1, scale: 0.8 });
            showButtonsTimeline.restart(true); 
        });

        heroArea.addEventListener("mouseleave", () => {
            showButtonsTimeline.reverse();
            showButtonsTimeline.eventCallback("onReverseComplete", () => {
                gsap.set(heroButtons, { opacity: 0.1, scale: 0.8 }); 
                flickerTimelines.forEach(tl => tl.restart(true)); // 깜빡임 재시작
            });
        });
        
        // 2-4. 스크롤 시 버튼 사라지는 애니메이션
       if (starObject) {
        starObject.addEventListener("mouseenter", () => {
            gsap.to(starObject, { 
                scale: 1.05, 
                rotation: 5, 
                duration: 0.6, 
                ease: "power1.out" 
            });
        });
        starObject.addEventListener("mouseleave", () => {
            gsap.to(starObject, { 
                scale: 1, 
                rotation: 0, 
                duration: 0.6, 
                ease: "power1.out" 
            });
        });
    }

    // 2-5. 스크롤 시 버튼 사라지는 애니메이션 (이전 2-4에서 순서 변경됨)
    gsap.to(".hero-btn", {
        opacity: 0,
        scrollTrigger: {
            trigger: "#hero",
            start: "bottom 80%", 
            end: "bottom 50%",
            scrub: true, 
        }
    });

        // ✅ 헤더가 특정 스크롤 지점에서 나타나고 사라지게 하는 기능 추가
    ScrollTrigger.create({
        trigger: "#divider-space", // 헤더를 띄울 기준 요소 (HTML에 이 ID가 있어야 함)
        start: "top 80px", // #divider-space 요소 상단이 뷰포트 80px 지점에 닿으면
        end: "bottom top",
        
        // 스크롤 다운하여 기준점에 닿았을 때 (헤더 나타남)
        onEnter: () => gsap.to("#main-header", { 
            opacity: 1, 
            y: 0, 
            pointerEvents: 'auto', 
            duration: 0.5 
        }),
        
        // 스크롤 업하여 기준점에서 벗어날 때 (헤더 사라짐)
        onLeaveBack: () => gsap.to("#main-header", { 
            opacity: 0, 
            y: '-100%', 
            pointerEvents: 'none', 
            duration: 0.5 
        })
    });
    }

    // =============================================
    // 3. Work.html 전용 기능: 장르 필터링
    // =============================================
    const genreFilterList = document.getElementById('genre-filter-list');
    const projectCards = document.querySelectorAll('.project-card');

    // 💥 안전장치: 필터 요소가 있는 (work.html) 페이지에서만 실행
    if (genreFilterList && projectCards.length > 0) {
        console.log("워크 페이지 필터 스크립트 실행");

        let activeGenre = genreFilterList.querySelector('.active')?.dataset.filter || 'all';

        function filterProjects() {
            projectCards.forEach(card => {
                const cardGenre = card.dataset.genre;
                const isMatch = (activeGenre === 'all') || (cardGenre === activeGenre);
                
                if (isMatch) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }

        genreFilterList.addEventListener('click', (e) => {
            const li = e.target.closest('li'); 
            if (!li) return; 

            const selectedFilter = li.dataset.filter;
            if (selectedFilter === activeGenre) return; 

            genreFilterList.querySelectorAll('li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');

            activeGenre = selectedFilter;
            filterProjects();
        });

        filterProjects(); // 초기 필터링 실행
    }


    // =============================================
    // 4. 공통 기능: 사용 프로그램 팝업창 (Skill Popup)
    // =============================================
    const popupOverlay = document.getElementById('popup-overlay');
    const skillBoxes = document.querySelectorAll('.skill-box');

    // 팝업 관련 요소가 있는 페이지에서만 실행
    if (popupOverlay && skillBoxes.length > 0) { 
        const closeBtn = document.querySelector('.popup-close-btn-new'); 
        const popupGridContent = document.getElementById('popup-grid-content');

// 작품 데이터 (실제 작품에 맞게 수정)
const workData = {
    'Figma': {
        title: 'Figma',
        works: [
            { num: '01. Visual Communication Typeface Essay', title: '비주얼 커뮤니케이션 서체 에세이', category: 'WEB', thumbnail: 'img/tool_figma4.png', link: 'work.html?filter=illustration'},
            { num: '02. Self-Introduction Website', title: '자기소개 웹사이트', category: 'WEB', thumbnail: 'img/tool_figma2.png', link: 'work.html#brand_identity' },
            { num: '03.Happiness Index Website', title: '행복지수 웹사이트', category: 'WEB', thumbnail: 'img/tool_figma1.jpg', link: 'work.html#ui_prototype' },
            { num: '04.Enneagram website', title: '애니어그램 웹사이트', category: 'WEB', thumbnail: 'img/tool_figma3.png', link: 'work.html#ui_prototype' }
        ]
    },
    'Blender': {
        title: 'Blender',
        works: [
            { num: '01.Tanzania Vision Trip Uangaze', title: '탄자니아 비전트립 우앙가제', category: '3D LOGO', thumbnail: 'img/tool_blender1.png', link: 'work.html#character' },
            { num: '02. Permafrost: The Awakening Memory of the Earth', title: '영구동토층: 깨어나는 땅의 기억', category: '3D VIDEO', thumbnail: 'img/tool_blender2.png', link: 'work.html#product_render' },
            { num: '03. Space Movie Teaser', title: '우주 영화 예고편', category: '3D VIDEO', thumbnail: 'img/tool_blender3.png', link: 'work.html#character' },
            { num: '04. Oops AR Storybook', title: 'Oops AR 동화책', category: 'AR', thumbnail: 'img/tool_blender4.png', link: 'work.html#character' },
        ]
    },
    'Premiere Pro <br> After Effects': {
        title: 'Video and Motion Graphics',
        works: [
            { num: '01. Wedding video ', title: '결혼 식전 영상', category: 'VIDEO', thumbnail: 'img/tool_video1.png', link: 'work.html#showreel' },
            { num: '02. University Department Introduction Video (FLOS) ', title: '디지털미디어디자인과 소개 영상', category: 'MOTION GRAPHICS', thumbnail: 'img/tool_video2.png', link: 'work.html#typography' },
            { num: '03. The abyss of the inner child ', title: '심연', category: 'XR', thumbnail: 'img/tool_video3.png', link: 'work.html#typography' },
            { num: '04. k-KONG ', title: '케이콩', category: 'After Effects', thumbnail: 'img/tool_video4.png', link: 'work.html#typography' },
            
        ]
    },
    'Photoshop <br> Illustrator <br> InDesign': {
        title: '2D',
        works: [
            { num: '01. Photo Frame Design', title: '인생네컷 사진 프레임 디자인 제작', category: 'GRAPHIC', thumbnail: 'img/tool_design1.png', link: 'work.html#poster_series' },
            { num: '02. Mongolia Outreach Invitation Design', title: '몽골 아웃리치 초대장 디자인', category: 'GRAPHIC', thumbnail: 'img/tool_design2.png', link: 'work.html#brochure' },
            { num: '03. High School Yearbook', title: '고등학교 졸업 교지', category: 'GRAPHIC', thumbnail: 'img/tool_design3.jpg', link: 'work.html#brochure' },
            { num: '04. We collect negative emotions.', title: '부정한 감정 수거해드립니다', category: 'Illustration', thumbnail: 'img/tool_design4.png', link: 'work.html#typography' },
        ]
    },
    'MadMapper <br> TouchDesigner': {
        title: 'Media Art',
        works: [
            { num: '01. Immersive Exhibition Design - Find the AI', title: 'AI를 찾아라', category: 'PROJECTION MAPPING', thumbnail: 'img/tool_mediaart1.png', link: 'work.html#installation' },
            { num: '02. p5.js K-pop Sound Media Art', title: '사운드 인터랙션', category: 'PROJECTION MAPPING', thumbnail: 'img/tool_mediaart2.png', link: 'work.html#realtime_visuals' },
            { num: '03. Nonlinear dialogue', title: '비선형 대화', category: 'INTERACTIVE MEDIA ART', thumbnail: 'img/tool_mediaart3.png', link: 'work.html#realtime_visuals' },
            { num: '04. Ep. 02', title: 'Ep. 02', category: 'INTERACTIVE MEDIA ART', thumbnail: 'img/tool_mediaart4.png', link: 'work.html#realtime_visuals' },
            
        ]
    },
    'Visual Studio Code': {
        title: '웹',
        works: [
            { num: '01. Code Fry Website Redesign', title: '코드 프라이 웹사이트 리다지인', category: 'VISUAL STUDIO CODE', thumbnail: 'img/tool_code1.png', link: 'work.html#portfolio_site' },
            { num: '02. Hyukoh Website Redesign', title: '혁오 웹사이트 리디자인', category: 'UNITY', thumbnail: 'img/tool_code2.png', link: 'work.html#web_art' },
            { num: '03. Portfolio Website', title: '포트폴리오 웹사이트', category: 'UVISUAL STUDIO CODE', thumbnail: 'img/tool_code3.png', link: 'work.html#web_art' },
            { num: '04. 2025 Portfolio Website', title: '2025 포트폴리오 웹사이트', category: 'UVISUAL STUDIO CODE', thumbnail: 'img/tool_code4.png', link: 'work.html#web_art' },
            
        ]
    }
};

        function openSkillPopup(toolKey) {
            const data = workData[toolKey];
            if (!data) return;

            popupGridContent.innerHTML = ''; 

            data.works.forEach(work => {
                const gridItem = document.createElement('a');
                gridItem.href = work.link;
                gridItem.classList.add('grid-item');
                gridItem.innerHTML = `
                    <div class="grid-item-left">
                        <span class="grid-item-number">${work.num}</span>
                        <h3 class="grid-item-title">${work.title}</h3>
                        <span class="grid-item-category">${work.category}</span>
                    </div>
                    <img src="${work.thumbnail}" alt="${work.title} Thumbnail" class="grid-item-thumbnail">
                `;
                popupGridContent.appendChild(gridItem);
            });

            popupOverlay.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
        }

        function closeSkillPopup() {
            popupOverlay.classList.remove('is-visible');
            document.body.style.overflow = 'auto';
        }

        // 스킬 박스 클릭 이벤트 리스너 추가
        skillBoxes.forEach(box => {
            box.addEventListener('click', () => {
                const toolKey = box.querySelector('h4').innerHTML.trim();
                openSkillPopup(toolKey);
            });
        });

        // 닫기 버튼 클릭 이벤트 (null 체크 추가)
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSkillPopup);
        }

        // 팝업창 바깥 영역 클릭 시 닫기
        popupOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'popup-overlay') {
                closeSkillPopup();
            }
        });

        // 키보드 ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                if (popupOverlay.classList.contains('is-visible')) {
                    closeSkillPopup();
                }
            }
        });
    }

});







 // =============================================
// ## Work.html 페이지 전용 스크립트 (필터링 + 페이지네이션 통합 버전)
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    const worksPerPage = 10; // 페이지당 보여줄 작품 수
    let currentPage = 1;
    let filteredWorks = []; // 현재 활성 필터에 의해 선택된 작품 카드 HTML 요소 목록

    // 필요한 HTML 요소들을 ID로 정확하게 가져옵니다.
    const genreFilterList = document.getElementById('genre-filter-list');
    const projectGrid = document.getElementById('project-grid');
    const paginationContainer = document.getElementById('pagination-container');
    const allProjectCards = Array.from(projectGrid.querySelectorAll('.project-card'));

    // 요소가 없으면 실행 중단 (초기 체크)
    if (!genreFilterList || allProjectCards.length === 0 || !paginationContainer) {
        console.warn("경고: 포트폴리오 섹션의 필수 요소가 부족합니다.");
        return; 
    }
    
    // ----------------------------------------------------
    // 1. 작품 표시 (displayWorks) 및 페이지네이션 (setupPagination) 함수
    // ----------------------------------------------------

    // 현재 페이지의 작품을 보여주고 나머지는 숨기는 함수
    function displayWorks(page) {
        // 페이지에 맞는 작품의 시작 및 끝 인덱스 계산
        const start = (page - 1) * worksPerPage;
        const end = start + worksPerPage;

        allProjectCards.forEach(card => card.style.display = 'none'); // 일단 모든 카드를 숨깁니다.

        filteredWorks.forEach((card, index) => {
            if (index >= start && index < end) {
                // 현재 페이지에 속하면 보이게 합니다.
                card.style.display = 'block'; 
            } else {
                // 현재 필터에는 속하지만 페이지 범위 밖이면 숨깁니다.
                card.style.display = 'none';
            }
        });
        
        // 페이지 이동 시 작품 그리드 상단으로 스크롤 (선택 사항)
        // projectGrid.scrollIntoView({ behavior: 'smooth' }); 
    }

    // 페이지네이션 버튼을 생성하는 함수
    function setupPagination() {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(filteredWorks.length / worksPerPage);

        // 페이지가 1개 이하면 버튼을 만들 필요가 없습니다.
        if (pageCount <= 1) return; 

        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            button.classList.add('page-btn');
            if (i === currentPage) {
                button.classList.add('active');
            }
            
            button.addEventListener('click', (e) => {
                currentPage = i;
                displayWorks(currentPage);
                
                // 활성화된 버튼 클래스 업데이트
                document.querySelectorAll('#pagination-container .page-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
            
            paginationContainer.appendChild(button);
        }
    }

    // ----------------------------------------------------
    // 2. 필터링 로직 (Pagination 연동) - [수정된 부분]
    // ----------------------------------------------------
    genreFilterList.addEventListener('click', (e) => {
        const li = e.target.closest('li'); 
        if (!li) return; 

        // 1. 필터 UI 업데이트
        genreFilterList.querySelectorAll('li').forEach(el => el.classList.remove('active'));
        li.classList.add('active');

        const filterValue = li.dataset.filter;
        
        // 2. filteredWorks 배열 업데이트 (다중 장르 처리 개선)
        if (filterValue === 'all') {
            filteredWorks = allProjectCards;
        } else {
            // 다중 장르(`Logo / Motion`, `3D / AR` 등)를 정확히 필터링
            filteredWorks = allProjectCards.filter(card => {
                const dataGenre = card.dataset.genre || '';
                
                // 1. data-genre 값을 쉼표, 슬래시, 공백을 기준으로 분리하고 소문자화
                const genresArray = dataGenre
                    .toLowerCase()
                    .split(/[\s\/\,]+/) // 공백, 슬래시, 쉼표를 기준으로 분리
                    .filter(g => g.length > 0); // 빈 문자열 제거
                
                // 2. 분리된 장르 배열에 현재 필터 값이 포함되는지 확인
                return genresArray.includes(filterValue); 
            });
        }

        // 3. 필터링된 결과로 1페이지부터 다시 시작 및 페이지네이션 업데이트
        currentPage = 1;
        displayWorks(currentPage);
        setupPagination();
    });

    // ----------------------------------------------------
    // 3. 초기화 (페이지 로드 시)
    // ----------------------------------------------------
    // 초기에는 'all' 필터와 동일하게 모든 작품을 대상으로 시작합니다.
    filteredWorks = allProjectCards;
    displayWorks(currentPage);
    setupPagination();
});



// script.js 파일 (또는 팝업을 다루는 스크립트)

const popupGridContent = document.getElementById('popup-grid-content');

// 예시: 'Figma' 팝업 내용을 생성하는 함수
function createFigmaPopupContent() {
    // workData에서 Figma 작품 목록을 가져옵니다. (workData가 이미 로드되어 있어야 함)
    const works = workData['Figma'] ? workData['Figma'].works : [];
    
    // 이전에 있던 내용을 비웁니다.
    popupGridContent.innerHTML = ''; 

    works.forEach(work => {
        // 1. 항목을 나타낼 DOM 요소 생성 (예: div)
        const workItem = document.createElement('div');
        workItem.classList.add('popup-work-item'); 
        
        // 썸네일, 제목 등 시각적인 내용 구성
        workItem.innerHTML = `
            <img src="${work.thumbnail}" alt="${work.title}" class="popup-work-thumbnail">
            <p class="popup-work-title">${work.title}</p>
        `;
        
        // 2. 가장 중요한 부분: 클릭 이벤트 리스너 추가
        workItem.addEventListener('click', () => {
            // workData에 저장된 'workdetail.html#2025_typo' 링크로 바로 이동
            window.location.href = work.link; 
        });
        
        // 3. 팝업 컨테이너에 항목 추가
        popupGridContent.appendChild(workItem);
    });
}



// 제공해주신 1번 JS 파일의 맨 마지막 줄 뒤에 이 코드를 추가하세요.

// =============================================
// 6. 작품 상세 미디어 렌더링 함수 추가 (workdetail.html에서 호출됨)
//    - projectDetailData는 다른 JS 파일에서 정의되었다고 가정합니다.
// =============================================
function renderProjectDetail(projectId) {
    // ⚠️ projectDetailData는 다른 JS 파일에 전역 변수로 정의되어 있어야 합니다.
    const project = window.projectDetailData ? window.projectDetailData[projectId] : null; 
    const detailContainer = document.getElementById('project-detail-section'); 

    if (!project || !detailContainer) {
        console.error("오류: 작품 데이터(projectDetailData)가 없거나 HTML 컨테이너(#project-detail-section)가 없습니다.");
        return; 
    }

    // 컨테이너 초기화
    detailContainer.innerHTML = ''; 

    // 1. 비디오 렌더링 로직
    if (project.video) {
        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('project-media-wrapper'); 

        const videoElement = document.createElement('video');
        videoElement.src = project.video.src; // 비디오 경로 삽입
        videoElement.alt = project.video.alt;
        
        // 필수 속성 추가
        videoElement.controls = true; 
        videoElement.loop = true;
        videoElement.muted = true;     
        videoElement.autoplay = true;  
        videoElement.classList.add('project-detail-video');
        
        videoWrapper.appendChild(videoElement);
        detailContainer.appendChild(videoWrapper); // 비디오를 컨테이너에 먼저 추가
    }
    
    // 2. 이미지 렌더링 로직 (기존 HTML 로직을 대체하여 이미지들을 복구)
    (project.images || []).forEach(image => {
        const block = document.createElement('div');
        block.classList.add('detail-block'); 
        
        block.innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
        detailContainer.appendChild(block);
    });

    // 3. 마지막 스크롤 공간 확보
    const finalSpace = document.createElement('div');
    finalSpace.classList.add('final-space');
    detailContainer.appendChild(finalSpace);
}







// script.js 파일

// 1. Draggable 플러그인 등록 (가장 먼저)
gsap.registerPlugin(Draggable);

const stones = gsap.utils.toArray(".space-stone");

stones.forEach((stone, index) => {
    
    // 💡 초기 설정: 중심점 보정 및 마우스 이벤트 활성화
    gsap.set(stone, { 
        xPercent: -50,   // X축 중심 보정
        yPercent: -50,   // Y축 중심 보정
        pointerEvents: "auto" // 드래그를 위해 마우스 이벤트 활성화 
    }); 
    
    // 2. 드래그 기능 생성 (우주 관성 적용)
    Draggable.create(stone, {
        type: "x,y",
        // edgeResistance와 bounds: "body"는 이전 단계의 문제로 인해
        // '#hero' 경계와 inertia 상세 설정으로 대체하는 것이 권장되지만,
        // 사용자님의 요청에 따라 기존 값으로 유지하고 inertia만 상세 조정합니다.
        edgeResistance: 0.8,
        bounds: "body",
        
        // 🚀 우주 중력처럼 부드럽게 미끄러지도록 inertia 상세 설정
        inertia: {
            duration: 5,                // 관성 움직임 시간을 5초로 매우 길게 설정 (오래 미끄러짐)
            ease: "none",               // 이징을 'none'으로 설정하여 제동 없이 일정한 속도로 미끄러지게 함
            velocity: 2,                // 마우스 속도를 2배로 증폭
            resistance: 10,             // 마찰 저항을 10으로 극단적으로 낮춤 (우주 느낌)
        }, 
        
        // 드래그 시작 시
        onDragStart: function() {
            gsap.to(stone, { opacity: 1, duration: 0.1 });
            gsap.getTweensOf(stone).forEach(t => t.pause());
            // 💡 자동 움직임(Self-Movement) 애니메이션 일시 정지
            stone.selfMovement.pause(); 
        },
        
        // 드래그 종료 시
        onDragEnd: function() {
            // 드래그가 끝난 후 회전 및 자동 움직임 애니메이션 재개
            stone.gsapAnimation.play();
            stone.selfMovement.play(); // 💡 자동 움직임 재개
            
            // 드래그 종료 시 opacity 복원
            gsap.to(stone, { opacity: 0.8, duration: 0.5 });
        }
    });

    // 3. 자체 회전 애니메이션 (기존 유지)
    const rotationDuration = 30 + (index * 5);
    const rotateAmount = (index % 2 === 0) ? 360 : -360;
    
    stone.gsapAnimation = gsap.to(stone, {
        rotation: rotateAmount,
        duration: rotationDuration,
        ease: "none",
        repeat: -1
    });

    // 4. 💡 스톤 스스로 움직이게 하는 애니메이션 추가 (Self-Movement)
    // x와 y축을 불규칙하게 움직여 부유하는 느낌을 줍니다.
    const moveDuration = 10 + (index * 2);
    const moveAmountX = (index % 3) * 10 + 20; // 20px ~ 50px 범위
    const moveAmountY = (index % 4) * 10 + 30; // 30px ~ 60px 범위

    stone.selfMovement = gsap.to(stone, {
        x: `+=${moveAmountX * (Math.random() > 0.5 ? 1 : -1)}`, // x축으로 랜덤하게 이동
        y: `+=${moveAmountY * (Math.random() > 0.5 ? 1 : -1)}`, // y축으로 랜덤하게 이동
        duration: moveDuration,
        ease: "sine.inOut", // 물결처럼 부드러운 움직임
        repeat: -1,
        yoyo: true // 갔다가 돌아오는 반복
    });
});


// script.js 파일의 끝에 추가

// URL에서 workId를 가져와 renderWorkDetail 함수를 호출하는 코드
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const workId = params.get('workId');
    
    // workId가 유효하면 데이터 렌더링 함수 실행
    if (workId && typeof renderWorkDetail === 'function') {
        renderWorkDetail(workId);
    }
});