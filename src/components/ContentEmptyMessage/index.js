import React     from 'react';
import {Link}    from 'react-router';
import PropTypes from 'prop-types';

import B2E    from 'quark/lib/buttons/B2E';

import './ContentEmptyMessage.less';

export default function ContentEmptyMessage (props) {
  return (
    <article className="content-empty-message">
        {props.title && (<h2 className="content-empty-message__title h3">{props.title}</h2>)}

        <div className={`content-empty-message__illustration content-empty-message__${props.page.toLowerCase()}`}> </div>

        <p className="content-empty-message__description t3">{props.description}</p>

        {props.linkUrl && (
          props.linkType === 'anchor' ? (
            <B2E
              className  = "content-empty-message__link"
              type       = "link"
              href       = {props.linkUrl}
              aria-label = {props.linkText}
            >
              {props.linkText}
            </B2E>
          ) : (
            <Link
              className  = "content-empty-message__link"
              to         = {props.linkUrl}
              aria-label = {props.linkText}
            >
              <B2E type="text">{props.linkText}</B2E>
            </Link>
          )
        )}

      {
        props.isButton && (
        <button
          onClick={props.buttonClick}
          className="button button_width_auto button_height_medium button_rounded_all button_bg_2 content-empty-message__link">
            {props.buttonText}
        </button>)
      }
    </article>
  );
}

ContentEmptyMessage.propTypes = {
  page        : PropTypes.string.isRequired,
  title       : PropTypes.string,
  description : PropTypes.string.isRequired,
  linkType    : PropTypes.oneOf(['anchor', 'link']),
  linkUrl     : PropTypes.string,
  linkText    : PropTypes.string,
  buttonText  : PropTypes.string,
  buttonClick : PropTypes.func,
  isButton    : PropTypes.bool
};
