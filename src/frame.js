// Define frame elements ids
const FRAME_ID = 'bt-frame';
const FRAME_CONTAINER_ID = 'bt-frame-container';

// Init config object
const config = {};

// Convert initial options to config object
if (typeof _bt !== 'undefined' && _bt.length > 0) {
    const _config = _bt.reduce(function(prev, curr) {
        prev[curr[0]] = curr[1];
        return prev;
    }, {});

    Object.assign(config, _config);
}

/**
 * Parse URL and return arguments provided in URL
 * 
 * @param {String} url - The URL to parse
 */
const parseUrl = url => {
    const args = {};
    const parts = url.split('&');

    parts.forEach(part => {
        const keyValue = part.split('=');
        args[keyValue[0]] = keyValue[1];
    });

    return args;
};

/**
 * Return project domain
 */
const getDomain = () => {
    // const protocol = document.location.protocol;
    return `//${config.project}.${config.host}`;
};

/**
 * Build URL for iframe using provided configuration
 */
const getFrameUrl = () => {
    const urlArgs = parseUrl(window.location.search.substring(1));
    const domain = getDomain();

    return `${domain}${urlArgs['_bt'] || ''}`;
};

/**
 * Return iframe object with defined options
 */
const createFrame = () => {
    // Render iframe
    var iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.id = 'bt-frame';
    iframe.scrolling = 'no';
    iframe.src = getFrameUrl();
    iframe.width = config.width || '100%';
    iframe.height = config.height || 1000;

    return iframe;
};

/**
 * Get provided element position on the page
 */
const getPosition = el => {
    let left = el.offsetLeft;
    let top = el.offsetTop;

    if (el.offsetParent) {
        let offset = el.offsetParent;
        do {
            left += offset.offsetLeft;
            top += offset.offsetTop;
        } while ((offset = offset.offsetParent));
    }

    return { left, top };
};

/**
 * Subscribe to cross-domain message
 * 
 * @param {Function} handler - The messages handler
 */
const listenMessages = handler => {
    // Normalize message before calling handler
    const _handler = message => {
        const data = JSON.parse(message.data);
        handler({ message, data });
    };

    if (window.addEventListener) {
        window.addEventListener('message', _handler);
    } else {
        window.attachEvent('onmessage', _handler);
    }
};

/**
 * Print received message to console
 * 
 * @param {MessageEvent} - Received message object
 * @param {Object}       - Normalized data 
 */
const logMessage = ({ message, data }) => {
    console.group('message');
    console.log('%c type', 'color: #2196F3', data.type);
    console.log('%c data', 'color: #4CAF50', data.message);
    console.groupEnd('message');
};

/**
 * Handle message received from iFrame content
 * 
 * @param {MessageEvent} - Received message object
 * @param {Object}       - Normalized data 
 */
const messageHandler = ({ message, data }) => {
    if (config.debug) {
        logMessage({ message, data });
    }

    // Get frame element
    const frame = document.getElementById('bt-frame');

    switch (data.type) {
        // Handle location change
        case 'location':
            {
                const parts = parseUrl(window.location.search.substring(1));

                let location = window.location.toString();
                if (parts['_bt'] === undefined) {
                    location += `?_bt=${data.message.pathname}`;
                } else {
                    location = location.replace(
                        /_bt=[^\&#]+/,
                        `_bt=${data.message.pathname}`,
                    );
                }

                window.history.replaceState({}, window.title, location);

                // Scroll to the top of the frame element
                const position = getPosition(frame);
                window.scrollTo(position.left, position.top);
            }
            break;

        // Change frame height to provided value
        case 'resize':
            {
                const height = data.message.height;
                frame.height = height > config.height ? height : config.height;
            }
            break;
    }
};

/**
 * Initialize the iFrame and add it to the page
 */
const init = () => {
    // Init frame
    document.write('<div id="bt-frame-container"></div>');
    const frameContainer = document.getElementById(FRAME_CONTAINER_ID);

    const frame = createFrame();
    frameContainer.appendChild(frame);

    // Listen for messages from frame
    listenMessages(messageHandler);
};

init();
