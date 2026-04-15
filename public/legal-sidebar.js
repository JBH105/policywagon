(function () {
  var initializedForPage = false;
  var destroySticky = null;

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function initLegalSidebar() {
    if (destroySticky) {
      destroySticky();
      destroySticky = null;
    }

    var sideNavWrapper = document.getElementById("sideNavWrapper");
    if (!sideNavWrapper) {
      initializedForPage = false;
      return;
    }

    if (initializedForPage) return;

    var legalContent = document.querySelector(".legal--legal--B1PVw");
    if (!legalContent) return;

    var heroHeading = document.querySelector(
      '[class*="legal--hero--"] h1, [class*="legal--hero--"] h3'
    );
    if (heroHeading && !heroHeading.id) {
      heroHeading.id = "main-heading";
    }

    var usedIds = new Set();
    usedIds.add("main-heading");

    var contentHeadings = Array.prototype.slice.call(
      legalContent.querySelectorAll("h1, h2, h3")
    );

    contentHeadings.forEach(function (heading) {
      if (!heading.id) {
        var base = slugify(heading.textContent || "section") || "section";
        var candidate = base;
        var i = 1;
        while (usedIds.has(candidate) || document.getElementById(candidate)) {
          candidate = base + "-" + i;
          i += 1;
        }
        heading.id = candidate;
      }
      usedIds.add(heading.id);
    });

    var ul = sideNavWrapper.querySelector("ul.d-none.d-md-block");
    if (!ul) return;

    function createItem(id, levelClass, text) {
      var li = document.createElement("li");
      li.className = levelClass;
      li.dataset.id = id;

      var marker = document.createElement("span");
      marker.className = "Sidebar--marker--AT5jY";

      var label = document.createElement("span");
      label.className = "Sidebar--text--oef5o";
      label.textContent = text;

      li.appendChild(marker);
      li.appendChild(label);
      return li;
    }

    var frag = document.createDocumentFragment();
    if (heroHeading) {
      frag.appendChild(
        createItem(
          "main-heading",
          "H1",
          (heroHeading.textContent || "").trim() || "Section"
        )
      );
    }

    contentHeadings.forEach(function (heading) {
      var tmp = document.createElement("div");
      tmp.innerHTML = heading.innerHTML;
      var text = (tmp.textContent || "").trim() || "Section";
      frag.appendChild(createItem(heading.id, heading.tagName, text));
    });

    ul.innerHTML = "";
    ul.appendChild(frag);

    var items = Array.prototype.slice.call(ul.querySelectorAll("li[data-id]"));

    function setActive(id) {
      items.forEach(function (item) {
        if (item.dataset.id === id) {
          item.classList.add("Sidebar--active--Q+63+");
        } else {
          item.classList.remove("Sidebar--active--Q+63+");
        }
      });
    }

    ul.onclick = function (event) {
      var target = event.target;
      var li = target && target.closest ? target.closest("li[data-id]") : null;
      if (!li) return;

      var id = li.dataset.id;
      if (!id) return;

      setActive(id);
      if (id === "main-heading") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      var section = document.getElementById(id);
      if (!section) return;

      var top = section.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: top, behavior: "smooth" });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        var best = null;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || entry.intersectionRatio <= 0) return;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        });
        if (best && best.target && best.target.id) {
          setActive(best.target.id);
        }
      },
      { rootMargin: "0px", threshold: 0.5 }
    );

    if (heroHeading) observer.observe(heroHeading);
    contentHeadings.forEach(function (heading) {
      observer.observe(heading);
    });

    setActive("main-heading");

    var scrollUpWrap = sideNavWrapper.querySelector(".Sidebar--scrollUp--AQ0qY");
    if (scrollUpWrap) {
      scrollUpWrap.remove();
    }

    var stickyLayer = sideNavWrapper.parentElement;
    var stickyRoot = sideNavWrapper.closest(".legal--sticky---bsKX");
    if (stickyLayer && stickyRoot) {
      var topOffset = 110;
      var ticking = false;
      var bottomGap = 24;
      var initialLeft = 0;
      var initialWidth = 0;
      var stickyRootTop = 0;
      var layerHeight = 0;
      var startY = 0;
      var endY = 0;

      function measure() {
        var layerRect = stickyLayer.getBoundingClientRect();
        initialLeft = layerRect.left;
        initialWidth = layerRect.width;
        layerHeight = stickyLayer.offsetHeight;
        stickyRootTop = stickyRoot.getBoundingClientRect().top + window.scrollY;

        var baseTop = stickyLayer.offsetTop || 0;
        startY = stickyRootTop + baseTop - topOffset;
        endY =
          stickyRootTop +
          stickyRoot.offsetHeight -
          layerHeight -
          bottomGap -
          topOffset;
      }

      function setStartState() {
        stickyLayer.style.position = "absolute";
        stickyLayer.style.top = "";
        stickyLayer.style.bottom = "";
        stickyLayer.style.left = "";
        stickyLayer.style.width = "";
        stickyLayer.style.transform = "";
        stickyLayer.style.pointerEvents = "auto";
        stickyLayer.style.zIndex = "8";
      }

      function setFixedState() {
        stickyLayer.style.position = "fixed";
        stickyLayer.style.top = topOffset + "px";
        stickyLayer.style.left = Math.round(initialLeft) + "px";
        stickyLayer.style.width = Math.round(initialWidth) + "px";
        stickyLayer.style.bottom = "";
        stickyLayer.style.transform = "";
        stickyLayer.style.pointerEvents = "auto";
        stickyLayer.style.zIndex = "20";
      }

      function setEndState() {
        var topWithinRoot = Math.max(
          0,
          stickyRoot.offsetHeight - layerHeight - bottomGap
        );
        stickyLayer.style.position = "absolute";
        stickyLayer.style.top = Math.round(topWithinRoot) + "px";
        stickyLayer.style.left = "";
        stickyLayer.style.width = "";
        stickyLayer.style.bottom = "";
        stickyLayer.style.transform = "";
        stickyLayer.style.pointerEvents = "auto";
        stickyLayer.style.zIndex = "8";
      }

      function applyStickyPosition() {
        if (window.innerWidth < 768) {
          setStartState();
          return;
        }

        measure();

        if (window.scrollY < startY) {
          setStartState();
          return;
        }

        if (window.scrollY >= endY) {
          setEndState();
          return;
        }

        setFixedState();
      }

      function requestUpdate() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          applyStickyPosition();
        });
      }

      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
      requestUpdate();

      destroySticky = function () {
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestUpdate);
        stickyLayer.style.position = "";
        stickyLayer.style.top = "";
        stickyLayer.style.left = "";
        stickyLayer.style.width = "";
        stickyLayer.style.bottom = "";
        stickyLayer.style.transform = "";
        stickyLayer.style.pointerEvents = "";
        stickyLayer.style.zIndex = "";
      };
    }

    initializedForPage = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLegalSidebar, {
      once: true,
    });
  } else {
    initLegalSidebar();
  }

  window.addEventListener("popstate", function () {
    initializedForPage = false;
    setTimeout(initLegalSidebar, 0);
  });
})();
