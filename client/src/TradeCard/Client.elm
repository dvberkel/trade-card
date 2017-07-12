module TradeCard.Client exposing (main)

import Html
import Html.Attributes as Attribute
import Html.Events as Event
import TradeCard.Card as Card
import TradeCard.Collection as Collection
import TradeCard.View as View


import Pouchdb
import Json.Encode as Encode
import Json.Decode as Decode
import Task


main : Program Never Model Message
main =
    Html.program
        {
          init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


init : (Model, Cmd Message)
init =
    let
        localDb =
            Pouchdb.db "card-events" Pouchdb.dbOptions

        request =
            Pouchdb.allDocsRequest
                |> (Pouchdb.include_docs True)

        task =
            Pouchdb.allDocs localDb request

        command = Task.attempt History task
    in
        (emptyModel localDb 1 15, command)


type alias Model =
    {
      message : Maybe String
    , localDb : Pouchdb.Pouchdb
    , cardId: String
    , collection: Collection.Collection
    }


emptyModel : Pouchdb.Pouchdb -> Int -> Int -> Model
emptyModel localDb low high =
    {
      message = Nothing
    , localDb = localDb
    , cardId = ""
    , collection = Collection.empty low high
    }


type Message =
      DoNothing
    | UpdateCardId String
    | Collect Card.Card
    | Trade Card.Card
    | Remove Card.Card
    | Post (Result Pouchdb.Fail Pouchdb.Post)
    | History (Result Pouchdb.Fail (Pouchdb.AllDocs Encode.Value))


update : Message -> Model -> (Model, Cmd Message)
update message model =
    case message of
        DoNothing ->
            (model, Cmd.none)

        Post msg ->
            let
                unpackedMessage =
                    unpack
                        (\m -> String.append "could not put message: " m.message)
                        (\m -> String.append "saved message with revision: " m.rev)
                        msg
            in
                ({ model | message = Just unpackedMessage }, Cmd.none)

        History msg ->
            let
                onError model msg =
                    (model, Cmd.none)

                onSuccess model msg =
                    let
                        filterMapFun aDoc =
                            case aDoc.doc of
                                Just document ->
                                    case Decode.decodeValue eventDecoder document of
                                        Ok event ->
                                            Just event

                                        Err _ ->
                                            Nothing

                                Nothing ->
                                    Nothing

                        events =
                            List.filterMap filterMapFun msg.docs

                        updatedCollection =
                            List.foldr applyEvent model.collection events
                    in
                        ({ model | collection = updatedCollection }, Cmd.none)
            in
                unpack (onError model) (onSuccess model) msg

        UpdateCardId representation ->
            ({ model | cardId = representation }, Cmd.none)

        Collect card ->
            let
                task = (Pouchdb.post model.localDb (encodeEvent (Collected card)))

                command = Task.attempt Post task
            in
                case Collection.collect card model.collection of
                    Ok nextCollection ->
                        ({ model | collection = nextCollection, cardId = "" }, command)

                    Err _ ->
                        (model, Cmd.none)

        Trade card ->
            let
                task = (Pouchdb.post model.localDb (encodeEvent (Traded card)))

                command = Task.attempt Post task

                nextCollection =
                    Collection.remove card model.collection
            in
                ({ model | collection = nextCollection, cardId = "" }, command)

        Remove card ->
            let
                task = (Pouchdb.post model.localDb (encodeEvent (Lost card)))

                command = Task.attempt Post task

                nextCollection =
                    Collection.remove card model.collection
            in
                ({ model | collection = nextCollection, cardId = "" }, command)


encodeEvent : CardEvent -> Encode.Value
encodeEvent eventType =
    let
        (cardType, cardId) =
            case eventType of
                Collected card ->
                    ("collected", card.id)

                Traded card ->
                    ("traded", card.id)

                Lost card ->
                    ("lost", card.id)
    in
        Encode.object
            [
              ("type", Encode.string cardType)
            , ("cardId", Encode.int cardId)
            ]


type CardEvent =
      Collected Card.Card
    | Traded Card.Card
    | Lost Card.Card


eventDecoder : Decode.Decoder CardEvent
eventDecoder =
    let
        cardEventMapper : String -> Int -> CardEvent
        cardEventMapper eventType cardId =
            let
                card = { id = cardId }
            in
                case eventType of
                    "collected" ->
                        Collected card

                    "traded" ->
                        Traded card

                    "lost" ->
                        Lost card

                    _ ->
                        Lost card -- TODO this should be improved

    in
        Decode.map2
            cardEventMapper
                (Decode.field "type" Decode.string)
                (Decode.field "cardId" Decode.int)


applyEvent : CardEvent -> Collection.Collection -> Collection.Collection
applyEvent event collection =
    case event of
        Collected card ->
            case Collection.collect card collection of
                Ok nextCollection ->
                    nextCollection

                Err _ ->
                    collection

        Traded card ->
            Collection.remove card collection

        Lost card ->
            Collection.remove card collection


unpack : (e -> b) -> (a -> b) -> Result e a -> b
unpack errFunc okFunc result =
    case result of
        Ok ok ->
            okFunc ok
        Err err ->
            errFunc err


view : Model -> Html.Html Message
view model =
    let
        message =
            model.message
                |> Maybe.withDefault ""

        trade =
            \c -> Trade c

        collect =
            \c -> Collect c

        lose =
            Just (\c -> Remove c)
    in
        Html.div
            []
            [
              Html.div [] [ Html.span [] [ Html.text message ] ]
            , Html.div
                  [ Attribute.class "collector"]
                  [
                    Html.input
                       [
                         Attribute.type_ "input"
                       , Attribute.value model.cardId
                       , Event.onInput UpdateCardId
                       ] []
                  ]
            , View.collectionView model.cardId collect lose trade collect model.collection
            ]


subscriptions : Model -> Sub Message
subscriptions _ = Sub.none
