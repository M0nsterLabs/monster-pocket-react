import React  from 'react';
import {Link} from 'react-router';

import B2E    from 'quark/lib/buttons/B2E';

import './ContentEmptyMessage.less';

export default function ContentEmptyMessage (props) {
  return (
    <article className="content-empty-message">
        <img
          className = "content-empty-message__illustration"
          src       = {require(`../../images/empty-content/empty-${props.page.toLowerCase()}.svg`)}
          alt       = {props.title}
        />

        <h2 className="content-empty-message__title h3">{props.title}</h2>
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
    </article>
  );
}

ContentEmptyMessage.propTypes = {
  page        : React.PropTypes.string.isRequired,
  title       : React.PropTypes.string.isRequired,
  description : React.PropTypes.string.isRequired,
  linkType    : React.PropTypes.oneOf(['anchor', 'link']),
  linkUrl     : React.PropTypes.string,
  linkText    : React.PropTypes.string
};
